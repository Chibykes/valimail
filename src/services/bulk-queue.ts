import { getEmailValidationAdapter } from "@/adapters";
import type { BulkJob } from "@/generated/prisma/client";
import { BulkJobStatus, BULK_QUEUE_TICK_MS } from "@/constants/validation";
import { ReachableHelper } from "@/helpers/reachable";
import { BulkJobRepository } from "@/repositories/bulk-job";
import type { ReacherBulkStatusResponse } from "@/types/reacher";

const inflight = new Map<string, Promise<void>>();

export class BulkQueueService {
  static start() {
    const state = globalThis as unknown as { bulkQueueStarted?: boolean };
    if (state.bulkQueueStarted) return;
    state.bulkQueueStarted = true;

    const timer = setInterval(() => {
      void BulkQueueService.tickAll();
    }, BULK_QUEUE_TICK_MS);
    timer.unref?.();
  }

  static tick(userId: string): Promise<void> {
    const existing = inflight.get(userId);
    if (existing) return existing;

    const run = BulkQueueService.run(userId).finally(() => {
      if (inflight.get(userId) === run) inflight.delete(userId);
    });
    inflight.set(userId, run);
    return run;
  }

  static async tickAll() {
    let userIds: string[] = [];
    try {
      userIds = await BulkJobRepository.listActiveUserIds(200);
    } catch (error) {
      console.error("[bulk-queue] tick failed", {
        message: error instanceof Error ? error.message : "unknown",
      });
      return;
    }

    for (const userId of userIds) {
      try {
        await BulkQueueService.tick(userId);
      } catch (error) {
        console.error("[bulk-queue] tick failed", {
          userId,
          message: error instanceof Error ? error.message : "unknown",
        });
      }
    }
  }

  private static async run(userId: string) {
    await BulkQueueService.refreshRunning(userId);
    const claimed = await BulkJobRepository.claimPending(userId);
    if (claimed.length === 0) return;

    const adapter = getEmailValidationAdapter();
    for (const job of claimed) {
      const emails = BulkQueueService.emailsOf(job);
      if (emails.length === 0) {
        console.error("[bulk-queue] pending job missing emails", { jobId: job.id });
        await BulkJobRepository.releaseClaim(job.id);
        continue;
      }

      try {
        const created = await adapter.createBulk(emails);
        const started = await BulkJobRepository.markSubmitted(job.id, created.job_id);
        if (!started) {
          console.info("[bulk-queue] list cancelled before start", { jobId: job.id });
          continue;
        }
        console.info("[bulk-queue] started", { jobId: job.id, total: emails.length });
      } catch (error) {
        console.error("[bulk-queue] start failed", {
          jobId: job.id,
          message: error instanceof Error ? error.message : "unknown",
        });
        await BulkJobRepository.releaseClaim(job.id);
      }
    }
  }

  private static async refreshRunning(userId: string) {
    const jobs = await BulkJobRepository.listRunning(userId);
    if (jobs.length === 0) return;

    const adapter = getEmailValidationAdapter();
    for (const job of jobs) {
      if (!job.reacherJobId) continue;
      try {
        const remote = await adapter.getBulkStatus(job.reacherJobId);
        await BulkJobRepository.updateFromStatus(
          job.id,
          BulkQueueService.remoteUpdate(job, remote),
        );
      } catch (error) {
        console.error("[bulk-queue] status failed", {
          jobId: job.id,
          message: error instanceof Error ? error.message : "unknown",
        });
      }
    }
  }

  private static remoteUpdate(job: BulkJob, remote: ReacherBulkStatusResponse) {
    const totalRecords = remote.total_records ?? job.totalRecords;
    const totalProcessed = remote.total_processed ?? job.totalProcessed;
    const statusFromRemote = ReachableHelper.mapBulkStatus(
      remote.status ?? remote.job_status,
    );
    const status =
      totalRecords > 0 && totalProcessed >= totalRecords
        ? BulkJobStatus.COMPLETED
        : statusFromRemote;
    const finishedAt =
      status === BulkJobStatus.COMPLETED
        ? remote.finished_at
          ? new Date(remote.finished_at)
          : (job.finishedAt ?? new Date())
        : null;

    return {
      status,
      totalRecords,
      totalProcessed,
      summarySafe: remote.summary?.total_safe ?? job.summarySafe,
      summaryRisky: remote.summary?.total_risky ?? job.summaryRisky,
      summaryInvalid: remote.summary?.total_invalid ?? job.summaryInvalid,
      summaryUnknown: remote.summary?.total_unknown ?? job.summaryUnknown,
      finishedAt,
    };
  }

  private static emailsOf(job: BulkJob): string[] {
    if (!Array.isArray(job.inputEmails)) return [];
    return job.inputEmails.filter(
      (item): item is string => typeof item === "string" && item.length > 0,
    );
  }
}
