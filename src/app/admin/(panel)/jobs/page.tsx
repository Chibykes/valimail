import Link from "next/link";
import { CancelJobButton } from "@/components/admin/cancel-job-button";
import { AppRoutes } from "@/constants/routes";
import { BulkJobStatus, DEFAULT_LIST_NAME } from "@/constants/validation";
import { cn } from "@/lib/utils";
import { AdminRepository } from "@/repositories/admin";

const FILTERS = [
  { label: "All", value: "" },
  { label: "Pending", value: BulkJobStatus.PENDING },
  { label: "Running", value: BulkJobStatus.RUNNING },
  { label: "Completed", value: BulkJobStatus.COMPLETED },
  { label: "Cancelled", value: BulkJobStatus.CANCELLED },
] as const;

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "" } = await searchParams;
  const selected = FILTERS.some((filter) => filter.value === status) ? status : "";
  const jobs = await AdminRepository.listJobs(selected || undefined);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Jobs</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cancelling a pending list refunds its credits. A running list stays with Reacher.
        </p>
      </div>
      <div className="flex flex-wrap gap-1">
        {FILTERS.map((filter) => (
          <Link
            key={filter.label}
            href={filter.value ? `${AppRoutes.ADMIN_JOBS}?status=${filter.value}` : AppRoutes.ADMIN_JOBS}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm",
              selected === filter.value
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {filter.label}
          </Link>
        ))}
      </div>
      {jobs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No lists in this view.</p>
      ) : (
        <ul className="divide-y divide-border/70 rounded-2xl border border-border">
          {jobs.map((job) => (
            <li key={job.id} className="flex flex-wrap items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{job.name ?? DEFAULT_LIST_NAME}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {job.user.email} · {job.status} · {job.totalProcessed.toLocaleString("en-US")}/
                  {job.totalRecords.toLocaleString("en-US")} ·{" "}
                  {job.createdAt.toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {job.status === BulkJobStatus.PENDING ? <CancelJobButton jobId={job.id} /> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
