import { DEFAULT_LIST_NAME } from "@/constants/validation";
import { AdminRepository } from "@/repositories/admin";

function formatAge(createdAt: Date) {
  const minutes = Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default async function AdminOverviewPage() {
  const data = await AdminRepository.overview();
  const cards = [
    { label: "Users", value: data.users.toLocaleString("en-US") },
    { label: "Credits outstanding", value: data.creditSum.toLocaleString("en-US") },
    { label: "Running", value: data.counts.running.toLocaleString("en-US") },
    { label: "Pending", value: data.counts.pending.toLocaleString("en-US") },
    { label: "Completed", value: data.counts.completed.toLocaleString("en-US") },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Lists waiting or running in Valimail. Reacher still performs the SMTP checks.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-border p-4">
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className="mt-2 font-display text-2xl font-semibold tabular-nums">{card.value}</p>
          </article>
        ))}
      </div>
      <section>
        <h2 className="font-display text-lg font-semibold">Active lists</h2>
        {data.activeJobs.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nothing is queued or running.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border/70 rounded-2xl border border-border">
            {data.activeJobs.map((job) => {
              const progress =
                job.totalRecords > 0
                  ? Math.round((job.totalProcessed / job.totalRecords) * 100)
                  : 0;
              return (
                <li key={job.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{job.name ?? DEFAULT_LIST_NAME}</p>
                    <p className="truncate text-xs text-muted-foreground">{job.user.email}</p>
                  </div>
                  <p className="text-right text-xs text-muted-foreground">
                    {job.status} · {formatAge(job.createdAt)}
                    <span className="mt-1 block tabular-nums">
                      {job.totalProcessed.toLocaleString("en-US")}/
                      {job.totalRecords.toLocaleString("en-US")} · {progress}%
                    </span>
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
