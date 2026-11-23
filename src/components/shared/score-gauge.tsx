"use client";

import { useEffect, useState } from "react";
import { ReachableHelper } from "@/helpers/reachable";
import { cn } from "@/lib/utils";

const RADIUS = 52;
const ARC = Math.PI * RADIUS;

export function ScoreGauge({
  score,
  status,
  className,
}: {
  score: number;
  status: unknown;
  className?: string;
}) {
  const [shown, setShown] = useState(0);
  const style = ReachableHelper.style(status);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(score));
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className={cn("relative w-40", className)}>
      <svg viewBox="0 0 120 68" className="w-full overflow-visible">
        <path
          d="M8 60a52 52 0 0 1 104 0"
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          className="stroke-muted"
        />
        <path
          d="M8 60a52 52 0 0 1 104 0"
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={ARC}
          strokeDashoffset={ARC - (ARC * shown) / 100}
          className={cn(
            "transition-[stroke-dashoffset] duration-1000 ease-out",
            style.stroke,
          )}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <p className="font-display text-3xl font-semibold tabular-nums">
          {score}
        </p>
        <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
          Score
        </p>
      </div>
    </div>
  );
}
