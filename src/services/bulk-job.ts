import { getEmailValidationAdapter } from "@/adapters";
import type { BulkJob } from "@/generated/prisma/client";
import {
  BULK_JOBS_PAGE_SIZE,
  BulkJobStatus,
  MAX_BULK_EMAILS,
  MAX_LIST_NAME_LENGTH,
} from "@/constants/validation";
import { EmailHelper } from "@/helpers/email";
import { ReachableHelper } from "@/helpers/reachable";
import { BulkJobRepository } from "@/repositories/bulk-job";
import { UserService } from "@/services/user";
import type {
  BulkJobListResponse,
  BulkJobResponse,
  BulkJobStatusResponse,
  BulkResultsResponse,
  CreateBulkResponse,
} from "@/types/api";

type UserParams = {
  clerkId: string;
  emailAddress: string;
};

export class BulkJobService {
  static async create(
    params: UserParams & { emails: string[]; name?: string },
  ): Promise<CreateBulkResponse> {
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
      name: params.name?.trim().slice(0, MAX_LIST_NAME_LENGTH) || null,
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

  static async list(params: UserParams): Promise<BulkJobListResponse> {
    const user = await UserService.ensureUser(
      params.clerkId,
      params.emailAddress,
    );
    const jobs = await BulkJobRepository.listForUser(
      user.id,
      BULK_JOBS_PAGE_SIZE,
    );
    return { jobs: jobs.map(BulkJobService.toResponse) };
  }

  static async getStatus(
    params: UserParams & { jobId: string },
  ): Promise<BulkJobStatusResponse> {
    const user = await UserService.ensureUser(
      params.clerkId,
      params.emailAddress,
    );

    const job = await BulkJobRepository.findByIdForUser(params.jobId, user.id);
    if (!job) {
      throw new NotFoundError("Bulk job not found");
    }
    if (job.status === BulkJobStatus.COMPLETED) {
      return BulkJobService.toResponse(job);
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
    const finishedAt =
      status === BulkJobStatus.COMPLETED
        ? remote.finished_at
          ? new Date(remote.finished_at)
          : (job.finishedAt ?? new Date())
        : null;

    const updated = await BulkJobRepository.updateFromStatus(job.id, {
      status,
      totalRecords,
      totalProcessed,
      summarySafe: remote.summary?.total_safe ?? job.summarySafe,
      summaryRisky: remote.summary?.total_risky ?? job.summaryRisky,
      summaryInvalid: remote.summary?.total_invalid ?? job.summaryInvalid,
      summaryUnknown: remote.summary?.total_unknown ?? job.summaryUnknown,
      finishedAt,
    });

    return BulkJobService.toResponse(updated);
  }

  static async getResults(
    params: UserParams & { jobId: string },
  ): Promise<BulkResultsResponse> {
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

  private static toResponse(job: BulkJob): BulkJobResponse {
    return {
      jobId: job.id,
      name: job.name,
      reacherJobId: job.reacherJobId,
      status: job.status,
      totalRecords: job.totalRecords,
      totalProcessed: job.totalProcessed,
      summary: {
        safe: job.summarySafe,
        risky: job.summaryRisky,
        invalid: job.summaryInvalid,
        unknown: job.summaryUnknown,
      },
      createdAt: job.createdAt.toISOString(),
      finishedAt: job.finishedAt?.toISOString() ?? null,
    };
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}
