import { StatusPill } from "@/components/shared/status-pill";
import { LIVE_FEED } from "@/constants/marketing";
import { cn } from "@/lib/utils";

export function LiveFeed() {
  const half = Math.ceil(LIVE_FEED.length / 2);
  const rows = [LIVE_FEED.slice(0, half), LIVE_FEED.slice(half)];

  return (
    <section className="border-y border-border/70 bg-surface py-10">
      <p className="mb-6 text-center text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
        Every address, checked three ways
      </p>
      <div className="mask-fade-x space-y-3 overflow-hidden">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={cn(
              "flex w-max animate-marquee gap-3 hover:[animation-play-state:paused]",
              rowIndex === 1 && "[animation-direction:reverse] [animation-duration:48s]",
            )}
          >
            {[...row, ...row, ...row, ...row].map((item, i) => (
              <div
                key={`${item.email}-${i}`}
                className="flex items-center gap-3 rounded-full border border-border bg-background py-1.5 pr-1.5 pl-4 shadow-sm"
              >
                <span className="font-mono text-[13px] text-foreground/80">
                  {item.email}
                </span>
                <StatusPill status={item.status} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
