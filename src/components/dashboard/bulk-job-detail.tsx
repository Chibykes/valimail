"use client";

import { ArrowLeft, Download, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { StackedBar } from "@/components/shared/stacked-bar";
import { StatusPill } from "@/components/shared/status-pill";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AppRoutes } from "@/constants/routes";
import { STATUS_ORDER, STATUS_STYLES } from "@/constants/status-styles";
import {
  BulkJobStatus,
  DEFAULT_LIST_NAME,
  RESULTS_FILTER_ALL,
  RESULTS_VISIBLE_STEP,
  type ReachableStatus,
} from "@/constants/validation";
import { BulkSummaryHelper } from "@/helpers/bulk-summary";
import { CsvHelper } from "@/helpers/csv";
import { DateHelper } from "@/helpers/date";
import { ResultSignalsHelper } from "@/helpers/result-signals";
import { useBulkJobResults, useBulkJobStatus } from "@/hooks/use-bulk-job";
import { cn } from "@/lib/utils";
import type { BulkJobResponse } from "@/types/api";
import type { ReacherCheckEmailResult } from "@/types/reacher";

type Filter = ReachableStatus | typeof RESULTS_FILTER_ALL;

export function BulkJobDetail({ jobId }: { jobId: string }) {
  const statusQuery = useBulkJobStatus(jobId);
  const job = statusQuery.data;
  const completed = job?.status === BulkJobStatus.COMPLETED;
  const resultsQuery = useBulkJobResults(jobId, completed);
  const [filter, setFilter] = useState<Filter>(RESULTS_FILTER_ALL);

  if (statusQuery.isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-5 py-10">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (statusQuery.isError || !job) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-10">
        <BackLink />
        <p className="mt-6 text-sm text-rose-600">
          Couldn&apos;t load this list. It may not exist or the verification engine is unreachable.
        </p>
      </div>
    );
  }

  return (
    <>
      <section className="relative border-b border-border/70 bg-surface">
        <div className="bg-dot-grid mask-fade-b pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-5 pt-8 pb-10">
          <BackLink />
          <JobHeader job={job} completed={completed} />
          {completed ? (
            <SummaryCards job={job} filter={filter} onFilter={setFilter} />
          ) : (
            <RunningProgress job={job} />
          )}
        </div>
      </section>

      {completed ? (
        <ResultsTable
          jobId={jobId}
          name={job.name ?? DEFAULT_LIST_NAME}
          filter={filter}
          onFilter={setFilter}
          loading={resultsQuery.isLoading}
          error={resultsQuery.isError}
          results={resultsQuery.data?.results ?? []}
          summary={job.summary}
        />
      ) : null}
    </>
  );
}

function BackLink() {
  return (
    <Link
      href={AppRoutes.DASHBOARD_LISTS}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4" /> All lists
    </Link>
  );
}

function JobHeader({ job, completed }: { job: BulkJobResponse; completed: boolean }) {
  return (
    <div className="mt-4 mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {job.name ?? DEFAULT_LIST_NAME}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {job.totalRecords.toLocaleString()} emails · created{" "}
          {DateHelper.relativeDay(job.createdAt).toLowerCase()} at {DateHelper.time(job.createdAt)}
        </p>
      </div>
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset",
          completed
            ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
            : "bg-brand-50 text-brand-700 ring-brand-600/20",
        )}
      >
        <span className="relative flex size-2">
          {!completed ? (
            <span className="absolute inline-flex size-full animate-ping-slow rounded-full bg-brand-400" />
          ) : null}
          <span
            className={cn(
              "relative inline-flex size-2 rounded-full",
              completed ? "bg-emerald-500" : "bg-brand-500",
            )}
          />
        </span>
        {completed ? "Completed" : "Validating"}
      </span>
    </div>
  );
}

function RunningProgress({ job }: { job: BulkJobResponse }) {
  const progress = BulkSummaryHelper.progressPercent(job.totalProcessed, job.totalRecords);
  return (
    <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-display text-5xl font-semibold tabular-nums">{progress}%</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {job.totalProcessed.toLocaleString()} of {job.totalRecords.toLocaleString()} processed
          </p>
        </div>
        <p className="text-xs text-muted-foreground">Updates every 2 seconds</p>
      </div>
      <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className="shimmer-bar h-full animate-shimmer rounded-full transition-[width] duration-700"
          style={{ width: `${Math.max(progress, 3)}%` }}
        />
      </div>
      {job.totalProcessed > 0 ? <StackedBar summary={job.summary} className="mt-4" /> : null}
    </div>
  );
}

function SummaryCards({
  job,
  filter,
  onFilter,
}: {
  job: BulkJobResponse;
  filter: Filter;
  onFilter: (filter: Filter) => void;
}) {
  const segments = BulkSummaryHelper.segments(job.summary);
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-display text-5xl font-semibold text-emerald-600 tabular-nums">
              {BulkSummaryHelper.deliverablePercent(job.summary)}%
            </p>
            <p className="mt-1 text-sm text-muted-foreground">of your list is deliverable</p>
          </div>
        </div>
        <StackedBar summary={job.summary} className="mt-5 h-2.5" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {segments.map((segment) => {
          const style = STATUS_STYLES[segment.status];
          const active = filter === segment.status;
          return (
            <button
              key={segment.status}
              type="button"
              onClick={() => onFilter(active ? RESULTS_FILTER_ALL : segment.status)}
              className={cn(
                "rounded-2xl border bg-background p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md",
                active ? "border-brand-300 ring-3 ring-brand-100" : "border-border",
              )}
            >
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className={cn("size-2 rounded-full", style.dot)} />
                {style.label}
              </span>
              <p className="mt-2 font-display text-2xl font-semibold tabular-nums">
                {segment.count.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">{Math.round(segment.percent)}%</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ResultsTable({
  jobId,
  name,
  filter,
  onFilter,
  loading,
  error,
  results,
  summary,
}: {
  jobId: string;
  name: string;
  filter: Filter;
  onFilter: (filter: Filter) => void;
  loading: boolean;
  error: boolean;
  results: Array<{ email: string; isReachable: string; raw: unknown }>;
  summary: BulkJobResponse["summary"];
}) {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(RESULTS_VISIBLE_STEP);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return results
      .filter((row) => filter === RESULTS_FILTER_ALL || row.isReachable === filter)
      .filter((row) => !needle || row.email.includes(needle))
      .map((row) => ({
        ...row,
        reason: ResultSignalsHelper.reason(row.raw as ReacherCheckEmailResult),
      }));
  }, [results, filter, query]);

  function exportCsv() {
    const csv = CsvHelper.toCsv(
      rows.map((row) => ({ email: row.email, status: row.isReachable, reason: row.reason })),
    );
    const suffix = filter === RESULTS_FILTER_ALL ? "all" : filter;
    CsvHelper.download(`${name.replace(/\s+/g, "-").toLowerCase()}-${suffix}-${jobId.slice(0, 6)}.csv`, csv);
  }

  const filters: Array<{ key: Filter; label: string; count: number }> = [
    { key: RESULTS_FILTER_ALL, label: "All", count: BulkSummaryHelper.total(summary) },
    ...STATUS_ORDER.map((status) => ({
      key: status,
      label: STATUS_STYLES[status].label,
      count: summary[status],
    })),
  ];

  return (
    <section className="mx-auto max-w-4xl px-5 py-10">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-surface p-1">
          {filters.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                onFilter(item.key);
                setVisible(RESULTS_VISIBLE_STEP);
              }}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                filter === item.key
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label} <span className="ml-1 text-muted-foreground">{item.count}</span>
            </button>
          ))}
        </div>
        <label className="ml-auto flex h-9 w-48 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-100">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search emails…"
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground/70"
          />
        </label>
        <Button variant="outline" className="h-9" onClick={exportCsv} disabled={!rows.length}>
          <Download /> Export {rows.length.toLocaleString()}
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : error ? (
        <p className="text-sm text-rose-600">Couldn&apos;t load results. Refresh to try again.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-border bg-surface px-4 py-2.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase sm:grid-cols-[1fr_180px_120px]">
            <span>Email</span>
            <span className="hidden sm:block">Reason</span>
            <span className="text-right">Status</span>
          </div>
          {rows.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">No results match.</p>
          ) : (
            <ul className="divide-y divide-border/70">
              {rows.slice(0, visible).map((row, i) => (
                <li
                  key={`${row.email}-${i}`}
                  className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-2.5 hover:bg-surface sm:grid-cols-[1fr_180px_120px]"
                >
                  <span className="truncate font-mono text-sm">{row.email}</span>
                  <span className="hidden truncate text-xs text-muted-foreground sm:block">
                    {row.reason}
                  </span>
                  <span className="flex justify-end">
                    <StatusPill status={row.isReachable} />
                  </span>
                </li>
              ))}
            </ul>
          )}
          {rows.length > visible ? (
            <button
              type="button"
              onClick={() => setVisible((v) => v + RESULTS_VISIBLE_STEP)}
              className="w-full border-t border-border py-3 text-sm font-medium text-brand-600 hover:bg-surface"
            >
              Show {Math.min(RESULTS_VISIBLE_STEP, rows.length - visible)} more
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
}
