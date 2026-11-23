import { Check } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { StatusPill } from "@/components/shared/status-pill";
import { HERO_TRUST_POINTS, LIVE_FEED } from "@/constants/marketing";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-brand-950 p-12 text-white lg:flex lg:flex-col">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-40 -left-20 h-[28rem] w-[28rem] rounded-full bg-brand-500/40 blur-3xl"
          aria-hidden
        />

        <div className="relative [&_span]:text-white">
          <Logo />
        </div>

        <div className="relative my-auto max-w-md">
          <h1 className="font-display text-4xl leading-tight font-semibold tracking-tight">
            Every address checked before it costs you a bounce.
          </h1>
          <ul className="mt-8 space-y-3">
            {HERO_TRUST_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-3 text-white/80">
                <span className="grid size-6 place-items-center rounded-full bg-white/10">
                  <Check className="size-3.5 text-emerald-300" strokeWidth={3} />
                </span>
                {point}
              </li>
            ))}
          </ul>

          <div className="mt-12 space-y-2.5">
            {LIVE_FEED.slice(0, 4).map((item, i) => (
              <div
                key={item.email}
                className="flex animate-fade-up items-center justify-between rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 backdrop-blur"
                style={{ animationDelay: `${i * 120}ms`, marginLeft: `${i * 18}px` }}
              >
                <span className="font-mono text-sm text-white/80">{item.email}</span>
                <StatusPill status={item.status} />
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="relative flex flex-col items-center justify-center bg-surface px-4 py-12">
        <div className="bg-dot-grid mask-fade-b pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mb-8 lg:hidden">
          <Logo />
        </div>
        <div className="relative">{children}</div>
      </main>
    </div>
  );
}
