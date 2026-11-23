import { Check, FileSpreadsheet, Server, X } from "lucide-react";
import { StackedBar } from "@/components/shared/stacked-bar";
import { StatusPill } from "@/components/shared/status-pill";
import { FeatureKey } from "@/constants/marketing";
import { ReachableStatus } from "@/constants/validation";
import { cn } from "@/lib/utils";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full min-h-[320px] items-center justify-center overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-brand-50 via-background to-surface p-8">
      <div className="bg-dot-grid absolute inset-0 opacity-60" aria-hidden />
      <div className="relative w-full max-w-sm">{children}</div>
    </div>
  );
}

function SyntaxIllustration() {
  return (
    <Frame>
      <div className="space-y-6">
        <div className="flex items-start justify-center gap-1.5 font-mono text-lg">
          <div className="flex flex-col items-center gap-2">
            <span className="rounded-xl border-2 border-brand-300 bg-background px-3 py-2 text-brand-700 shadow-sm">
              maria
            </span>
            <span className="font-sans text-xs text-muted-foreground">username</span>
          </div>
          <span className="flex h-12 items-center px-1 text-muted-foreground">@</span>
          <div className="flex flex-col items-center gap-2">
            <span className="rounded-xl border-2 border-emerald-300 bg-background px-3 py-2 text-emerald-700 shadow-sm">
              northwind.io
            </span>
            <span className="font-sans text-xs text-muted-foreground">domain</span>
          </div>
        </div>
        <div className="space-y-2 rounded-2xl border border-border bg-background p-4 shadow-sm">
          {[
            ["No illegal characters", true],
            ["Single @ symbol", true],
            ["Valid top-level domain", true],
          ].map(([label, ok]) => (
            <div key={String(label)} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className={cn("grid size-5 place-items-center rounded-full", ok ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                {ok ? <Check className="size-3" strokeWidth={3} /> : <X className="size-3" strokeWidth={3} />}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

function MxIllustration() {
  const records = [
    ["10", "mx1.northwind.io"],
    ["20", "mx2.northwind.io"],
    ["30", "backup.mailhost.net"],
  ];
  return (
    <Frame>
      <div className="relative">
        <div className="mx-auto w-fit rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm shadow-sm">
          northwind.io
        </div>
        <svg viewBox="0 0 320 60" className="w-full text-brand-300" aria-hidden>
          {[60, 160, 260].map((x) => (
            <path
              key={x}
              d={`M160 0 C160 30 ${x} 30 ${x} 60`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="5 5"
            />
          ))}
        </svg>
        <div className="grid grid-cols-3 gap-2">
          {records.map(([priority, host]) => (
            <div key={host} className="rounded-xl border border-border bg-background p-3 text-center shadow-sm">
              <Server className="mx-auto size-5 text-brand-600" />
              <p className="mt-2 truncate font-mono text-[10px] text-muted-foreground">{host}</p>
              <p className="mt-1 text-[10px] font-semibold text-emerald-600">priority {priority}</p>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

function SmtpIllustration() {
  const lines = [
    ["out", "EHLO verify.valimail.app"],
    ["in", "250 mx1.northwind.io Hello"],
    ["out", "MAIL FROM:<check@valimail.app>"],
    ["in", "250 2.1.0 OK"],
    ["out", "RCPT TO:<maria@northwind.io>"],
    ["in", "250 2.1.5 Recipient OK"],
    ["out", "QUIT"],
  ] as const;
  return (
    <Frame>
      <div className="overflow-hidden rounded-2xl border border-brand-900/20 bg-brand-950 font-mono text-[12px] shadow-xl">
        <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
          <span className="size-2 rounded-full bg-white/20" />
          <span className="size-2 rounded-full bg-white/20" />
          <span className="size-2 rounded-full bg-white/20" />
          <span className="ml-2 text-[10px] text-white/40">smtp · port 25</span>
        </div>
        <div className="space-y-1.5 p-4">
          {lines.map(([dir, text], i) => (
            <p
              key={text}
              className={cn("animate-fade-up", dir === "out" ? "text-brand-200" : "text-emerald-300")}
              style={{ animationDelay: `${i * 140}ms` }}
            >
              <span className="mr-2 text-white/30">{dir === "out" ? "→" : "←"}</span>
              {text}
            </p>
          ))}
          <p className="pt-2 text-[11px] text-white/40">No email was sent.</p>
        </div>
      </div>
    </Frame>
  );
}

function ProfilingIllustration() {
  const rows = [
    ["Disposable provider", false],
    ["Role account (info@, sales@)", true],
    ["Catch-all domain", false],
    ["Free webmail", false],
  ] as const;
  return (
    <Frame>
      <div className="rounded-2xl border border-border bg-background p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 font-display text-lg font-semibold text-white">
            S
          </div>
          <div className="min-w-0">
            <p className="truncate font-mono text-sm">sales@brightpath.co</p>
            <p className="text-xs text-muted-foreground">Business domain</p>
          </div>
          <StatusPill status={ReachableStatus.RISKY} className="ml-auto" />
        </div>
        <div className="mt-5 space-y-3">
          {rows.map(([label, on]) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className={cn("relative h-5 w-9 rounded-full transition", on ? "bg-amber-400" : "bg-muted")}>
                <span className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow transition-all", on ? "left-[18px]" : "left-0.5")} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

function ListsIllustration() {
  const rows = [
    ["ana@lumen.studio", ReachableStatus.SAFE],
    ["sales@brightpath.co", ReachableStatus.RISKY],
    ["temp8812@mailinator.com", ReachableStatus.INVALID],
    ["kofi@harbor.dev", ReachableStatus.SAFE],
  ] as const;
  return (
    <Frame>
      <div className="rounded-2xl border border-border bg-background p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <FileSpreadsheet className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">newsletter-q4.csv</p>
            <p className="text-xs text-muted-foreground">4,812 emails · 72% deliverable</p>
          </div>
        </div>
        <StackedBar
          summary={{ safe: 72, risky: 14, invalid: 11, unknown: 3 }}
          className="mt-4 h-2"
        />
        <div className="mt-4 divide-y divide-border/70">
          {rows.map(([email, status]) => (
            <div key={email} className="flex items-center justify-between py-2">
              <span className="truncate font-mono text-xs text-muted-foreground">{email}</span>
              <StatusPill status={status} />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

export function FeatureIllustration({ feature }: { feature: FeatureKey }) {
  switch (feature) {
    case FeatureKey.SYNTAX:
      return <SyntaxIllustration />;
    case FeatureKey.MX:
      return <MxIllustration />;
    case FeatureKey.SMTP:
      return <SmtpIllustration />;
    case FeatureKey.PROFILING:
      return <ProfilingIllustration />;
    case FeatureKey.LISTS:
      return <ListsIllustration />;
  }
}
