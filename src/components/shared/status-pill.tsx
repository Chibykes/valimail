import { ReachableHelper } from "@/helpers/reachable";
import { cn } from "@/lib/utils";

export function StatusPill({
  status,
  className,
}: {
  status: unknown;
  className?: string;
}) {
  const style = ReachableHelper.style(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        style.soft,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", style.dot)} />
      {style.label}
    </span>
  );
}
