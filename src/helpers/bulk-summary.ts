import { STATUS_ORDER } from "@/constants/status-styles";
import type { ReachableStatus } from "@/constants/validation";
import type { BulkSummary } from "@/types/api";

export type SummarySegment = {
  status: ReachableStatus;
  count: number;
  percent: number;
};

export class BulkSummaryHelper {
  static total(summary: BulkSummary): number {
    return summary.safe + summary.risky + summary.invalid + summary.unknown;
  }

  static segments(summary: BulkSummary): SummarySegment[] {
    const total = this.total(summary);
    return STATUS_ORDER.map((status) => ({
      status,
      count: summary[status],
      percent: total > 0 ? (summary[status] / total) * 100 : 0,
    }));
  }

  static deliverablePercent(summary: BulkSummary): number {
    const total = this.total(summary);
    return total > 0 ? Math.round((summary.safe / total) * 100) : 0;
  }

  static progressPercent(processed: number, total: number): number {
    if (total <= 0) return 0;
    return Math.min(100, Math.round((processed / total) * 100));
  }
}
