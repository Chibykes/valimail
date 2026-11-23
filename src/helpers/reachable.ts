import { ReachableStatus } from "@/constants/validation";

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

  static label(status: string): string {
    switch (this.normalize(status)) {
      case ReachableStatus.SAFE:
        return "Safe";
      case ReachableStatus.RISKY:
        return "Risky";
      case ReachableStatus.INVALID:
        return "Invalid";
      default:
        return "Unknown";
    }
  }

  static badgeVariant(
    status: string,
  ): "default" | "secondary" | "destructive" | "outline" {
    switch (this.normalize(status)) {
      case ReachableStatus.SAFE:
        return "default";
      case ReachableStatus.RISKY:
        return "secondary";
      case ReachableStatus.INVALID:
        return "destructive";
      default:
        return "outline";
    }
  }

  static mapBulkStatus(status: unknown): "Running" | "Completed" {
    const raw = String(status ?? "").toLowerCase();
    if (raw === "completed" || raw === "done" || raw === "finished") {
      return "Completed";
    }
    return "Running";
  }
}
