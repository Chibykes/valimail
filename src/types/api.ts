import type { BulkJobStatus, ReachableStatus } from "@/constants/validation";
import type { ReacherCheckEmailResult } from "@/types/reacher";

export type ApiErrorBody = {
  error: string;
  details?: unknown;
  code?: string;
};

export type CheckEmailRequest = {
  email?: string;
  to_email?: string;
};

export type CheckEmailResponse = {
  email: string;
  isReachable: ReachableStatus | string;
  source: string;
  result: ReacherCheckEmailResult;
  checkId: string;
};

export type CreateBulkRequest = {
  input?: string[];
  emails?: string[];
};

export type CreateBulkResponse = {
  jobId: string;
  reacherJobId: string;
  status: BulkJobStatus | string;
};

export type BulkJobResponse = {
  jobId: string;
  reacherJobId: string;
  status: BulkJobStatus | string;
  totalRecords: number;
  totalProcessed: number;
  summary: {
    safe: number;
    risky: number;
    invalid: number;
    unknown: number;
  };
  createdAt: string;
  finishedAt: string | null;
};

/** Alias used by some services/hooks */
export type BulkJobStatusResponse = BulkJobResponse;

export type BulkResultsResponse = {
  jobId: string;
  results: Array<{
    email: string;
    isReachable: string;
    raw: ReacherCheckEmailResult | unknown;
  }>;
};
