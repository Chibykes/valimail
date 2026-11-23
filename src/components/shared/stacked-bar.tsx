import { STATUS_STYLES } from "@/constants/status-styles";
import { BulkSummaryHelper } from "@/helpers/bulk-summary";
import { cn } from "@/lib/utils";
import type { BulkSummary } from "@/types/api";

export function StackedBar({
  summary,
  className,
}: {
  summary: BulkSummary;
  className?: string;
}) {
  const segments = BulkSummaryHelper.segments(summary).filter(
    (segment) => segment.count > 0,
  );

  return (
    <div
      className={cn(
        "flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full bg-muted",
        className,
      )}
    >
      {segments.map((segment) => (
        <div
          key={segment.status}
          title={`${STATUS_STYLES[segment.status].label}: ${segment.count}`}
          className={cn(
            "h-full rounded-full transition-[width] duration-700",
            STATUS_STYLES[segment.status].bar,
          )}
          style={{ width: `${segment.percent}%` }}
        />
      ))}
    </div>
  );
}
