"use client";

import { ChevronRight, FileText, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { StackedBar } from "@/components/shared/stacked-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { AppRoutes } from "@/constants/routes";
import { BulkJobStatus, DEFAULT_LIST_NAME } from "@/constants/validation";
import { BulkSummaryHelper } from "@/helpers/bulk-summary";
import { DateHelper } from "@/helpers/date";
import { useBulkJobs } from "@/hooks/use-bulk-job";
import type { BulkJobResponse } from "@/types/api";

export function MyLists() {
  const { data, isLoading, isError } = useBulkJobs();
  const [query, setQuery] = useState("");

  const jobs = useMemo(() => data?.jobs ?? [], [data]);
  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? jobs.filter((job) => (job.name ?? DEFAULT_LIST_NAME).toLowerCase().includes(needle))
      : jobs;
    return DateHelper.groupBy(filtered, (job) => job.createdAt);
  }, [jobs, query]);

  return (
    <section className="mx-auto max-w-3xl px-5 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="font-display text-lg font-semibold">
          My lists{" "}
          <span className="ml-1 text-sm font-normal text-muted-foreground">{jobs.length}</span>
        </h2>
        <label className="flex h-9 w-56 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-100">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lists…"
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground/70"
          />
        </label>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-rose-600">Couldn&apos;t load your lists. Refresh to try again.</p>
      ) : groups.length === 0 ? (
        <EmptyState
          title={query ? "No lists match your search" : "No lists yet"}
          description={
            query
              ? "Try a different name."
              : "Paste or upload your first list above. Results show up here as soon as the job starts."
          }
        />
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                {group.label}
              </p>
              <ul className="divide-y divide-border/70 rounded-2xl border border-border">
                {group.entries.map((job) => (
                  <ListRow key={job.jobId} job={job} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ListRow({ job }: { job: BulkJobResponse }) {
  const pending = job.status === BulkJobStatus.PENDING;
  const running = job.status === BulkJobStatus.RUNNING;
  const progress = BulkSummaryHelper.progressPercent(job.totalProcessed, job.totalRecords);

  return (
    <li>
      <Link
        href={AppRoutes.dashboardJob(job.jobId)}
        className="group flex items-center gap-4 px-4 py-3.5 transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-surface"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-background text-muted-foreground group-hover:border-brand-200 group-hover:text-brand-600">
          <FileText className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{job.name ?? DEFAULT_LIST_NAME}</p>
          <p className="text-xs text-muted-foreground">
            {DateHelper.relativeDay(job.createdAt)} · {job.totalRecords.toLocaleString()} emails
          </p>
        </div>
        <div className="hidden w-48 items-center gap-3 sm:flex">
          {pending ? (
            <span className="ml-auto text-xs text-amber-700">Queued</span>
          ) : running ? (
            <>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="shimmer-bar h-full animate-shimmer rounded-full transition-[width] duration-700"
                  style={{ width: `${Math.max(progress, 6)}%` }}
                />
              </div>
              <span className="w-20 text-right text-xs text-brand-600">Processing {progress}%</span>
            </>
          ) : (
            <>
              <StackedBar summary={job.summary} className="flex-1" />
              <span className="w-20 text-right text-xs text-muted-foreground">
                {BulkSummaryHelper.deliverablePercent(job.summary)}% deliverable
              </span>
            </>
          )}
        </div>
        <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </Link>
    </li>
  );
}
