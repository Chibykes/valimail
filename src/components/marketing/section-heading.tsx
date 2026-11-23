import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "light",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  tone?: "light" | "dark";
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
      )}
    >
      <p
        className={cn(
          "text-xs font-semibold tracking-[0.2em] uppercase",
          tone === "dark" ? "text-brand-300" : "text-brand-600",
        )}
      >
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-4 text-lg",
            tone === "dark" ? "text-white/65" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
