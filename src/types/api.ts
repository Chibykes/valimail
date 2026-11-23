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

export type RecentCheck = {
  id: string;
  email: string;
  isReachable: ReachableStatus | string;
  source: string;
  createdAt: string;
};

export type RecentChecksResponse = {
  checks: RecentCheck[];
};

export type CreateBulkRequest = {
  input?: string[];
  emails?: string[];
  name?: string;
};

export type CreateBulkResponse = {
  jobId: string;
  reacherJobId: string;
  status: BulkJobStatus | string;
};

export type BulkSummary = {
  safe: number;
  risky: number;
  invalid: number;
  unknown: number;
};

export type BulkJobResponse = {
  jobId: string;
  name: string | null;
  reacherJobId: string;
  status: BulkJobStatus | string;
  totalRecords: number;
  totalProcessed: number;
  summary: BulkSummary;
  createdAt: string;
  finishedAt: string | null;
};

/** Alias used by some services/hooks */
export type BulkJobStatusResponse = BulkJobResponse;

export type BulkJobListResponse = {
  jobs: BulkJobResponse[];
};

export type ApiKeyRecord = {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

export type ApiKeyListResponse = {
  keys: ApiKeyRecord[];
};

export type ApiKeyCreatedResponse = ApiKeyRecord & {
  key: string;
};

export type BulkResultsResponse = {
  jobId: string;
  results: Array<{
    email: string;
    isReachable: string;
    raw: ReacherCheckEmailResult | unknown;
  }>;
};
