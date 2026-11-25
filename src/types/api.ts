import type { BulkJobStatus, ReachableStatus } from "@/constants/validation";
import type { ReacherCheckEmailResult } from "@/types/reacher";

export type ApiErrorBody = {
  error: string;
  details?: unknown;
  code?: string;
  balance?: number;
  required?: number;
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
  reacherJobId: string | null;
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
  reacherJobId: string | null;
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

export type BillingEntry = {
  id: string;
  delta: number;
  balanceAfter: number;
  reason: string;
  createdAt: string;
};

export type BillingAccountResponse = {
  balance: number;
  entries: BillingEntry[];
};

export type CheckoutResponse = {
  url: string;
};

export type CheckoutConfirmStatus =
  | "granted"
  | "already_credited"
  | "unpaid"
  | "pending"
  | "ignored";

export type CheckoutConfirmResponse = {
  status: CheckoutConfirmStatus;
  balance: number;
};

export type BulkResultsResponse = {
  jobId: string;
  results: Array<{
    email: string;
    isReachable: string;
    raw: ReacherCheckEmailResult | unknown;
  }>;
};
