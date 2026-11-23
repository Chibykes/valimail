import { STATUS_STYLES, type StatusStyle } from "@/constants/status-styles";
import { ReachableStatus } from "@/constants/validation";
import type { ReacherCheckEmailResult } from "@/types/reacher";

const BASE_SCORES: Record<ReachableStatus, number> = {
  [ReachableStatus.SAFE]: 96,
  [ReachableStatus.RISKY]: 58,
  [ReachableStatus.INVALID]: 4,
  [ReachableStatus.UNKNOWN]: 35,
};

export class ReachableHelper {
  static normalize(value: unknown): ReachableStatus {
    const raw = String(value ?? "").toLowerCase();
    switch (raw) {
      case ReachableStatus.SAFE:
        return ReachableStatus.SAFE;
      case ReachableStatus.RISKY:
        return ReachableStatus.RISKY;
      case ReachableStatus.INVALID:
        return ReachableStatus.INVALID;
      default:
        return ReachableStatus.UNKNOWN;
    }
  }

  static style(status: unknown): StatusStyle {
    return STATUS_STYLES[this.normalize(status)];
  }

  static label(status: unknown): string {
    return this.style(status).label;
  }

  static score(result: ReacherCheckEmailResult): number {
    const status = this.normalize(result.is_reachable);
    let score = BASE_SCORES[status];

    if (status === ReachableStatus.SAFE || status === ReachableStatus.RISKY) {
      if (result.misc?.is_role_account) score -= 8;
      if (result.misc?.is_disposable) score -= 20;
      if (result.smtp?.is_catch_all) score -= 10;
      if (result.smtp?.has_full_inbox) score -= 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  static mapBulkStatus(status: unknown): "Running" | "Completed" {
    const raw = String(status ?? "").toLowerCase();
    if (raw === "completed" || raw === "done" || raw === "finished") {
      return "Completed";
    }
    return "Running";
  }
}
