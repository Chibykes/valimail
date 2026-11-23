import { AlertTriangle, Check, Minus, X } from "lucide-react";
import { SignalTone } from "@/constants/validation";
import type { ResultSignal } from "@/helpers/result-signals";
import { cn } from "@/lib/utils";

const TONE_STYLES: Record<SignalTone, { icon: typeof Check; className: string }> = {
  [SignalTone.GOOD]: { icon: Check, className: "bg-emerald-50 text-emerald-600" },
  [SignalTone.WARN]: { icon: AlertTriangle, className: "bg-amber-50 text-amber-600" },
  [SignalTone.BAD]: { icon: X, className: "bg-rose-50 text-rose-600" },
  [SignalTone.NEUTRAL]: { icon: Minus, className: "bg-muted text-muted-foreground" },
};

export function SignalList({
  signals,
  className,
}: {
  signals: readonly ResultSignal[];
  className?: string;
}) {
  return (
    <ul className={cn("divide-y divide-border/70", className)}>
      {signals.map((signal, index) => {
        const tone = TONE_STYLES[signal.tone];
        const Icon = tone.icon;
        return (
          <li
            key={signal.key}
            className="flex animate-fade-up items-center justify-between gap-3 py-2.5 text-sm"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <span className="flex items-center gap-2.5 text-muted-foreground">
              <span
                className={cn(
                  "grid size-5 place-items-center rounded-full",
                  tone.className,
                )}
              >
                <Icon className="size-3" strokeWidth={2.5} />
              </span>
              {signal.label}
            </span>
            <span className="font-medium text-foreground">{signal.value}</span>
          </li>
        );
      })}
    </ul>
  );
}
