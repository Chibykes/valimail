import type { BulkJob } from "@/generated/prisma/client";
import { getEmailValidationAdapter } from "@/adapters";
import {
  BULK_JOBS_PAGE_SIZE,
  MAX_BULK_EMAILS,
  MAX_LIST_NAME_LENGTH,
} from "@/constants/validation";
import { EmailHelper } from "@/helpers/email";
import { ReachableHelper } from "@/helpers/reachable";
import { BulkJobRepository } from "@/repositories/bulk-job";
import { CreditRepository } from "@/repositories/credit";
import { BulkQueueService } from "@/services/bulk-queue";
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
    const name = params.name?.trim().slice(0, MAX_LIST_NAME_LENGTH) || null;
    const job = await CreditRepository.acceptBulkJob({
      userId: user.id,
      name,
      emails: valid,
    });

    try {
      await BulkQueueService.tick(user.id);
    } catch (error) {
      console.error("[bulk] queue tick failed", {
        jobId: job.id,
        message: error instanceof Error ? error.message : "unknown",
      });
    }

    const fresh = await BulkJobRepository.findById(job.id);
    return BulkJobService.toCreateResponse(fresh ?? job);
  }

  static async list(params: UserParams): Promise<BulkJobListResponse> {
    const user = await UserService.ensureUser(
      params.clerkId,
      params.emailAddress,
    );
    try {
      await BulkQueueService.tick(user.id);
    } catch (error) {
      console.error("[bulk] queue tick failed", {
        message: error instanceof Error ? error.message : "unknown",
      });
    }
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

    try {
      await BulkQueueService.tick(user.id);
    } catch (error) {
      console.error("[bulk] queue tick failed", {
        jobId: job.id,
        message: error instanceof Error ? error.message : "unknown",
      });
    }

    const fresh = await BulkJobRepository.findByIdForUser(params.jobId, user.id);
    if (!fresh) {
      throw new NotFoundError("Bulk job not found");
    }
    return BulkJobService.toResponse(fresh);
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
    if (!job.reacherJobId) {
      return { jobId: job.id, results: [] };
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

  private static toCreateResponse(job: BulkJob): CreateBulkResponse {
    return {
      jobId: job.id,
      reacherJobId: job.reacherJobId,
      status: job.status,
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
