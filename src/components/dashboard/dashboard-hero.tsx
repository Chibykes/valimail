import type { LucideIcon } from "lucide-react";

export function DashboardHero({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border/70 bg-surface">
      <div className="bg-dot-grid mask-fade-b pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-3xl px-5 pt-10 pb-12">
        <div className="mb-6 flex items-start gap-3.5 animate-fade-up">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-brand-200 bg-gradient-to-b from-background to-brand-50 text-brand-600 shadow-sm">
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="animate-fade-up [animation-delay:80ms]">{children}</div>
      </div>
    </section>
  );
}
