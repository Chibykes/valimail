import { Bot, Mail, ShieldAlert, TrendingDown, UserX } from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";
import { USE_CASES } from "@/constants/marketing";

function MarketingArt() {
  return (
    <div className="relative h-full w-full p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <TrendingDown className="size-4 text-emerald-600" />
        Bounce rate
      </div>
      <svg viewBox="0 0 240 90" className="mt-2 w-full" aria-hidden>
        <defs>
          <linearGradient id="uc-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="oklch(0.67 0.18 264)" stopOpacity="0.35" />
            <stop offset="1" stopColor="oklch(0.67 0.18 264)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 12 C40 14 60 30 90 44 S150 70 240 78 V90 H0 Z"
          fill="url(#uc-area)"
        />
        <path
          d="M0 12 C40 14 60 30 90 44 S150 70 240 78"
          fill="none"
          stroke="oklch(0.57 0.21 264)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="240" cy="78" r="4" fill="oklch(0.72 0.17 158)" />
      </svg>
      <div className="flex justify-between font-mono text-[11px]">
        <span className="text-rose-600">8.9%</span>
        <span className="text-emerald-600">0.4%</span>
      </div>
    </div>
  );
}

function SignupArt() {
  return (
    <div className="flex h-full w-full flex-col justify-center gap-2.5 p-5">
      <div className="flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-xs">
        <Mail className="size-3.5 text-muted-foreground" />
        <span className="font-mono text-muted-foreground">x7k2@tempbox.io</span>
        <span className="ml-auto grid size-5 place-items-center rounded-full bg-rose-50 text-rose-600">
          <UserX className="size-3" />
        </span>
      </div>
      <p className="text-[11px] text-rose-600">Disposable address blocked</p>
      <div className="flex h-9 items-center justify-center rounded-lg bg-muted text-xs font-medium text-muted-foreground">
        <Bot className="mr-1.5 size-3.5" /> Bot signup stopped
      </div>
    </div>
  );
}

function FraudArt() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {[-14, 0, 14].map((rotate, i) => (
        <div
          key={rotate}
          className="absolute h-20 w-32 rounded-xl border border-border bg-background shadow-sm"
          style={{ transform: `rotate(${rotate}deg) translateY(${i * -4}px)` }}
        >
          <div className="m-3 h-2 w-16 rounded-full bg-muted" />
          <div className="mx-3 h-2 w-10 rounded-full bg-muted" />
        </div>
      ))}
      <div className="relative grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-700/40">
        <ShieldAlert className="size-7" />
      </div>
    </div>
  );
}

const ART = {
  marketing: MarketingArt,
  signups: SignupArt,
  fraud: FraudArt,
} as const;

export function UseCasesSection() {
  return (
    <section id="use-cases" className="scroll-mt-20 bg-surface py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Use cases"
          title="Built for anyone who sends email"
          description="Running a newsletter, an e-commerce store, a SaaS or marketing campaigns? Valimail keeps your data honest."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {USE_CASES.map((item) => {
            const Art = ART[item.key];
            return (
              <article
                key={item.key}
                className="group overflow-hidden rounded-3xl border border-border bg-background transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px] hover:shadow-brand-900/25"
              >
                <div className="h-44 border-b border-border/70 bg-gradient-to-br from-brand-50 to-surface">
                  <Art />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
