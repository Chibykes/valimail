import { CircleAlert, CircleCheck, CircleHelp, CircleX } from "lucide-react";
import { ScoreGauge } from "@/components/shared/score-gauge";
import { SignalList } from "@/components/shared/signal-list";
import { StatusPill } from "@/components/shared/status-pill";
import { ReachableStatus } from "@/constants/validation";
import { ReachableHelper } from "@/helpers/reachable";
import type { ResultSignal } from "@/helpers/result-signals";
import { cn } from "@/lib/utils";

const STATUS_ICONS = {
  [ReachableStatus.SAFE]: CircleCheck,
  [ReachableStatus.RISKY]: CircleAlert,
  [ReachableStatus.INVALID]: CircleX,
  [ReachableStatus.UNKNOWN]: CircleHelp,
} as const;

export type ResultPanelData = {
  email: string;
  status: string;
  score: number;
  title?: string;
  body?: string;
  signals: readonly ResultSignal[];
};

export function ResultPanel({
  data,
  className,
}: {
  data: ResultPanelData;
  className?: string;
}) {
  const status = ReachableHelper.normalize(data.status);
  const style = ReachableHelper.style(status);
  const Icon = STATUS_ICONS[status];

  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="truncate font-mono text-sm text-muted-foreground">
          {data.email}
        </p>
        <StatusPill status={status} />
      </div>

      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <Icon className={cn("size-7", style.text)} strokeWidth={2} />
          <h3 className="font-display text-xl leading-tight font-semibold">
            {data.title ?? style.headline}
          </h3>
          <p className="text-sm text-muted-foreground">
            {data.body ?? style.description}
          </p>
        </div>
        <ScoreGauge score={data.score} status={status} className="w-32 shrink-0" />
      </div>

      <SignalList signals={data.signals} />
    </div>
  );
}
