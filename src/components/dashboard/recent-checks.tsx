"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { StatusPill } from "@/components/shared/status-pill";
import { Skeleton } from "@/components/ui/skeleton";
import { DateHelper } from "@/helpers/date";
import { useRecentChecks } from "@/hooks/use-check-email";

export function RecentChecks() {
  const { data, isLoading, isError } = useRecentChecks();
  const checks = data?.checks ?? [];

  return (
    <section className="mx-auto max-w-3xl px-5 py-10">
      <h2 className="mb-6 font-display text-lg font-semibold">Recent checks</h2>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-rose-600">Couldn&apos;t load recent checks.</p>
      ) : checks.length === 0 ? (
        <EmptyState
          title="No checks yet"
          description="Validate an address above. Your last few results will appear here."
        />
      ) : (
        <ul className="divide-y divide-border/70 rounded-2xl border border-border">
          {checks.map((check) => (
            <li key={check.id} className="flex items-center gap-4 px-4 py-3">
              <span className="min-w-0 flex-1 truncate font-mono text-sm">{check.email}</span>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {DateHelper.relativeDay(check.createdAt)}, {DateHelper.time(check.createdAt)}
              </span>
              <StatusPill status={check.isReachable} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
