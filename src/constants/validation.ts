export const ReachableStatus = {
  SAFE: "safe",
  RISKY: "risky",
  INVALID: "invalid",
  UNKNOWN: "unknown",
} as const;

export type ReachableStatus =
  (typeof ReachableStatus)[keyof typeof ReachableStatus];

export const BulkJobStatus = {
  RUNNING: "Running",
  COMPLETED: "Completed",
} as const;

export type BulkJobStatus = (typeof BulkJobStatus)[keyof typeof BulkJobStatus];

export const BULK_POLL_INTERVAL_MS = 2000;
export const MAX_BULK_EMAILS = 10_000;
