import type { ReachableStatus } from "@/constants/validation";

export type ReacherMiscDetails = {
  is_disposable?: boolean;
  is_role_account?: boolean;
  is_bounced?: boolean;
  [key: string]: unknown;
};

export type ReacherCheckEmailResult = {
  input: string;
  is_reachable: ReachableStatus | string;
  misc?: ReacherMiscDetails | null;
  mx?: {
    accepts_mail?: boolean;
    records?: string[];
  } | null;
  smtp?: {
    can_connect_smtp?: boolean;
    has_full_inbox?: boolean;
    is_catch_all?: boolean;
    is_deliverable?: boolean;
    is_disabled?: boolean;
  } | null;
  syntax?: {
    address?: string | null;
    domain?: string | null;
    is_valid_syntax?: boolean;
    username?: string | null;
  } | null;
  [key: string]: unknown;
};

export type ReacherBulkCreateResponse = {
  job_id: string;
};

export type ReacherBulkStatusResponse = {
  job_id?: string;
  total_records?: number;
  total_processed?: number;
  summary?: {
    total_safe?: number;
    total_risky?: number;
    total_invalid?: number;
    total_unknown?: number;
  };
  status?: string;
  job_status?: string;
  finished_at?: string | null;
  created_at?: string;
  [key: string]: unknown;
};

export type ReacherBulkResultsResponse = {
  results?: ReacherCheckEmailResult[];
  data?: ReacherCheckEmailResult[];
  [key: string]: unknown;
};
