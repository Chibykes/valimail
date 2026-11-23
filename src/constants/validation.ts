export const ReachableStatus = {
  SAFE: "safe",
  RISKY: "risky",
  INVALID: "invalid",
  UNKNOWN: "unknown",
} as const;

export type ReachableStatus =
  (typeof ReachableStatus)[keyof typeof ReachableStatus];

export const SignalTone = {
  GOOD: "good",
  WARN: "warn",
  BAD: "bad",
  NEUTRAL: "neutral",
} as const;

export type SignalTone = (typeof SignalTone)[keyof typeof SignalTone];

export const BulkJobStatus = {
  RUNNING: "Running",
  COMPLETED: "Completed",
} as const;

export type BulkJobStatus = (typeof BulkJobStatus)[keyof typeof BulkJobStatus];

export const BULK_POLL_INTERVAL_MS = 2000;
export const MAX_BULK_EMAILS = 10_000;
export const MAX_LIST_NAME_LENGTH = 80;
export const BULK_JOBS_PAGE_SIZE = 50;
export const RECENT_CHECKS_PAGE_SIZE = 10;
export const DEFAULT_LIST_NAME = "Untitled list";
export const RESULTS_FILTER_ALL = "all";
export const RESULTS_VISIBLE_STEP = 50;
