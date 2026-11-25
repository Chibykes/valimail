"use client";

import { Gauge, Loader2, Mail, Server, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import {
  ResultPanel,
  type ResultPanelData,
} from "@/components/shared/result-panel";
import { DEMO_SAMPLES } from "@/constants/marketing";

const TYPE_SPEED_MS = 55;
const CHECKING_MS = 1100;
const RESULT_HOLD_MS = 3400;

const CHECK_STEPS = [
  "Parsing address format",
  "Resolving MX records",
  "Opening SMTP conversation",
] as const;

type Phase = "typing" | "checking" | "result";

export function HeroShowcase({ result }: { result: ResultPanelData | null }) {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");

  const sample = DEMO_SAMPLES[index];

  useEffect(() => {
    if (result) return;

    if (phase === "typing") {
      if (typed >= sample.email.length) {
        const timer = setTimeout(() => setPhase("checking"), 250);
        return () => clearTimeout(timer);
      }
      const timer = setTimeout(() => setTyped((n) => n + 1), TYPE_SPEED_MS);
      return () => clearTimeout(timer);
    }

    if (phase === "checking") {
      const timer = setTimeout(() => setPhase("result"), CHECKING_MS);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setIndex((i) => (i + 1) % DEMO_SAMPLES.length);
      setTyped(0);
      setPhase("typing");
    }, RESULT_HOLD_MS);
    return () => clearTimeout(timer);
  }, [phase, typed, sample.email.length, result]);

  const displayEmail = result ? result.email : sample.email.slice(0, typed);
  const showResult = result || phase === "result";

  return (
    <div className="relative mx-auto w-full max-w-md animate-fade-up [animation-delay:150ms] lg:max-w-none">
      <OrbitRings />

      <FloatingChip
        className="-top-5 -left-4 sm:-left-10"
        icon={<Server className="size-3.5 text-brand-600" />}
        label="MX lookup"
        value="12 ms"
      />
      <FloatingChip
        className="top-1/3 -right-3 [animation-delay:1.2s] sm:-right-10"
        icon={<ShieldCheck className="size-3.5 text-emerald-600" />}
        label="SMTP"
        value="250 OK"
      />
      <FloatingChip
        className="-bottom-5 left-6 [animation-delay:2.4s]"
        icon={<Gauge className="size-3.5 text-amber-600" />}
        label="Disposable"
        value="Not detected"
      />

      <div className="relative rounded-3xl border border-border/80 bg-background/95 p-2 shadow-[0_30px_80px_-24px] shadow-brand-900/30 backdrop-blur">
        <div className="flex items-center gap-1.5 px-3 py-2">
          <span className="size-2.5 rounded-full bg-rose-300" />
          <span className="size-2.5 rounded-full bg-amber-300" />
          <span className="size-2.5 rounded-full bg-emerald-300" />
          <span className="ml-3 rounded-md bg-muted px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
            valimail · verify
          </span>
        </div>

        <div className="rounded-2xl border border-border/70 bg-surface p-5 sm:p-6">
          <div className="flex h-12 items-center gap-3 rounded-xl border border-border bg-background px-4">
            <Mail className="size-4 text-muted-foreground" />
            <span className="truncate font-mono text-sm">
              {displayEmail}
              {!result && phase === "typing" ? (
                <span className="ml-px inline-block h-4 w-px translate-y-0.5 animate-caret bg-foreground" />
              ) : null}
            </span>
          </div>

          <div className="mt-6 min-h-[340px]">
            {showResult ? (
              <ResultPanel
                key={result ? result.email : index}
                data={result ?? sample}
                className="animate-fade-up"
              />
            ) : phase === "checking" ? (
              <CheckingState />
            ) : (
              <IdleState />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckingState() {
  return (
    <div className="space-y-4">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="shimmer-bar h-full w-full animate-shimmer" />
      </div>
      <ul className="space-y-3">
        {CHECK_STEPS.map((step, i) => (
          <li
            key={step}
            className="flex animate-fade-up items-center gap-3 text-sm text-muted-foreground"
            style={{ animationDelay: `${i * 220}ms` }}
          >
            <Loader2 className="size-4 animate-spin text-brand-500" />
            {step}…
          </li>
        ))}
      </ul>
    </div>
  );
}

function IdleState() {
  return (
    <div className="space-y-3 pt-2">
      {[80, 60, 70, 45].map((width) => (
        <div
          key={width}
          className="h-3 rounded-full bg-muted"
          style={{ width: `${width}%` }}
        />
      ))}
    </div>
  );
}

function FloatingChip({
  className,
  icon,
  label,
  value,
}: {
  className: string;
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className={`absolute z-10 hidden animate-float items-center gap-2 rounded-xl border border-border/80 bg-background/95 px-3 py-2 text-xs shadow-lg shadow-brand-900/10 backdrop-blur sm:flex ${className}`}
    >
      <span className="grid size-6 place-items-center rounded-lg bg-muted">
        {icon}
      </span>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function OrbitRings() {
  return (
    <svg
      viewBox="0 0 600 600"
      className="pointer-events-none absolute top-1/2 left-1/2 -z-10 hidden w-[150%] -translate-x-1/2 -translate-y-1/2 text-brand-200 sm:block"
      aria-hidden
    >
      {[140, 200, 260].map((r, i) => (
        <circle
          key={r}
          cx="300"
          cy="300"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray={i === 1 ? "4 8" : undefined}
          opacity={1 - i * 0.25}
        />
      ))}
      <circle cx="440" cy="300" r="5" className="fill-brand-400" />
      <circle cx="300" cy="100" r="4" className="fill-emerald-400" />
      <circle cx="120" cy="420" r="4" className="fill-amber-400" />
    </svg>
  );
}
