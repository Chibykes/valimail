import { getEmailValidationAdapter } from "@/adapters";
import { BulkJobStatus, MAX_BULK_EMAILS } from "@/constants/validation";
import { EmailHelper } from "@/helpers/email";
import { ReachableHelper } from "@/helpers/reachable";
import { BulkJobRepository } from "@/repositories/bulk-job";
import { UserService } from "@/services/user";
import type {
  BulkJobStatusResponse,
  BulkResultsResponse,
  CreateBulkResponse,
} from "@/types/api";

export class BulkJobService {
  static async create(params: {
    clerkId: string;
    emailAddress: string;
    emails: string[];
  }): Promise<CreateBulkResponse> {
    const normalized = EmailHelper.parseList(params.emails.join("\n"));
    const { valid } = EmailHelper.filterValid(normalized);

    if (valid.length === 0) {
      throw new Error("No valid emails provided");
    }
    if (valid.length > MAX_BULK_EMAILS) {
      throw new Error(`Maximum ${MAX_BULK_EMAILS} emails per bulk job`);
    }

    const user = await UserService.ensureUser(
      params.clerkId,
      params.emailAddress,
    );

    const adapter = getEmailValidationAdapter();
    const created = await adapter.createBulk(valid);

    const job = await BulkJobRepository.create({
      userId: user.id,
      reacherJobId: created.job_id,
      status: BulkJobStatus.RUNNING,
      totalRecords: valid.length,
    });

    return {
      jobId: job.id,
      reacherJobId: job.reacherJobId,
      status: job.status,
    };
  }

  static async getStatus(params: {
    clerkId: string;
    emailAddress: string;
    jobId: string;
  }): Promise<BulkJobStatusResponse> {
    const user = await UserService.ensureUser(
      params.clerkId,
      params.emailAddress,
    );

    const job = await BulkJobRepository.findByIdForUser(params.jobId, user.id);
    if (!job) {
      throw new NotFoundError("Bulk job not found");
    }

    const adapter = getEmailValidationAdapter();
    const remote = await adapter.getBulkStatus(job.reacherJobId);

    const totalRecords = remote.total_records ?? job.totalRecords;
    const totalProcessed = remote.total_processed ?? job.totalProcessed;
    const statusFromRemote = ReachableHelper.mapBulkStatus(
      remote.status ?? remote.job_status,
    );
    const status =
      totalRecords > 0 && totalProcessed >= totalRecords
        ? BulkJobStatus.COMPLETED
        : statusFromRemote;
    const summarySafe = remote.summary?.total_safe ?? job.summarySafe;
    const summaryRisky = remote.summary?.total_risky ?? job.summaryRisky;
    const summaryInvalid = remote.summary?.total_invalid ?? job.summaryInvalid;
    const summaryUnknown = remote.summary?.total_unknown ?? job.summaryUnknown;
    const finishedAt =
      status === BulkJobStatus.COMPLETED
        ? remote.finished_at
          ? new Date(remote.finished_at)
          : job.finishedAt ?? new Date()
        : null;

    const updated = await BulkJobRepository.updateFromStatus(job.id, {
      status,
      totalRecords,
      totalProcessed,
      summarySafe,
      summaryRisky,
      summaryInvalid,
      summaryUnknown,
      finishedAt,
    });

    return {
      jobId: updated.id,
      reacherJobId: updated.reacherJobId,
      status: updated.status,
      totalRecords: updated.totalRecords,
      totalProcessed: updated.totalProcessed,
      summary: {
        safe: updated.summarySafe,
        risky: updated.summaryRisky,
        invalid: updated.summaryInvalid,
        unknown: updated.summaryUnknown,
      },
      createdAt: updated.createdAt.toISOString(),
      finishedAt: updated.finishedAt?.toISOString() ?? null,
    };
  }

  static async getResults(params: {
    clerkId: string;
    emailAddress: string;
    jobId: string;
  }): Promise<BulkResultsResponse> {
    const user = await UserService.ensureUser(
      params.clerkId,
      params.emailAddress,
    );

    const job = await BulkJobRepository.findByIdForUser(params.jobId, user.id);
    if (!job) {
      throw new NotFoundError("Bulk job not found");
    }

    const adapter = getEmailValidationAdapter();
    const remote = await adapter.getBulkResults(job.reacherJobId);
    const items = remote.results ?? remote.data ?? [];

    return {
      jobId: job.id,
      results: items.map((item) => ({
        email: String(item.input ?? ""),
        isReachable: ReachableHelper.normalize(item.is_reachable),
        raw: item,
      })),
    };
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}
