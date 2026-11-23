import { Database, Gauge, Layers, ShieldCheck, Workflow } from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";
import { PIPELINE_STEPS } from "@/constants/marketing";

const STEP_ICONS = {
  app: ShieldCheck,
  queue: Layers,
  engine: Workflow,
  store: Database,
} as const;

const HIGHLIGHTS = [
  {
    icon: Gauge,
    title: "Throttled by design",
    body: "Checks run through a queue so your mail server IP keeps a clean reputation.",
  },
  {
    icon: Database,
    title: "Your data stays home",
    body: "Lists and results live in your own Postgres, never a third-party vendor.",
  },
  {
    icon: Workflow,
    title: "Swappable engine",
    body: "The verification engine sits behind an adapter, so you can change it anytime.",
  },
] as const;

export function PipelineSection() {
  return (
    <section
      id="reliability"
      className="relative scroll-mt-20 overflow-hidden bg-brand-950 py-24 text-white"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Reliability"
          title="Up and running on your own infrastructure"
          description="Every check flows through a pipeline you control, from the dashboard to the database."
          tone="dark"
        />

        <div className="relative mt-16">
          <svg
            className="absolute top-10 left-0 hidden h-2 w-full md:block"
            preserveAspectRatio="none"
            viewBox="0 0 100 2"
            aria-hidden
          >
            <line
              x1="12"
              y1="1"
              x2="88"
              y2="1"
              stroke="oklch(0.67 0.18 264)"
              strokeWidth="1.5"
              strokeDasharray="6 6"
              vectorEffect="non-scaling-stroke"
              className="animate-dash"
            />
          </svg>
          <ol className="relative grid gap-6 md:grid-cols-4">
            {PIPELINE_STEPS.map((step, i) => {
              const Icon = STEP_ICONS[step.key];
              return (
                <li key={step.key} className="flex flex-col items-center text-center">
                  <div className="relative grid size-20 place-items-center rounded-2xl border border-white/15 bg-white/5 backdrop-blur">
                    <Icon className="size-8 text-brand-200" />
                    <span className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-brand-500 text-[11px] font-semibold">
                      {i + 1}
                    </span>
                  </div>
                  <p className="mt-4 font-display text-lg font-semibold">{step.title}</p>
                  <p className="mt-1 text-sm text-white/60">{step.body}</p>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"
            >
              <Icon className="size-5 text-emerald-300" />
              <p className="mt-4 font-semibold">{title}</p>
              <p className="mt-1.5 text-sm text-white/60">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
