export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-surface/60 px-6 py-14 text-center">
      <svg viewBox="0 0 160 110" className="w-40" aria-hidden>
        <ellipse cx="80" cy="100" rx="56" ry="6" className="fill-muted" />
        <g className="animate-float">
          <rect x="30" y="22" width="100" height="66" rx="10" className="fill-background stroke-border" strokeWidth="2" />
          <path d="m34 28 46 34 46-34" fill="none" className="stroke-brand-300" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="122" cy="26" r="13" className="fill-brand-500" />
          <path d="m116 26 4 4 8-8" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <circle cx="22" cy="40" r="3" className="fill-emerald-300" />
        <circle cx="146" cy="70" r="2.5" className="fill-amber-300" />
        <circle cx="18" cy="78" r="2" className="fill-brand-300" />
      </svg>
      <p className="mt-5 font-display text-lg font-semibold">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
