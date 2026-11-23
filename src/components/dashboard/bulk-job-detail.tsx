"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BulkJobStatus } from "@/constants/validation";
import { CsvHelper } from "@/helpers/csv";
import { ReachableHelper } from "@/helpers/reachable";
import { useBulkJobResults, useBulkJobStatus } from "@/hooks/use-bulk-job";

export function BulkJobDetail({ jobId }: { jobId: string }) {
  const statusQuery = useBulkJobStatus(jobId);
  const completed = statusQuery.data?.status === BulkJobStatus.COMPLETED;
  const resultsQuery = useBulkJobResults(jobId, Boolean(completed));

  if (statusQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (statusQuery.isError || !statusQuery.data) {
    return (
      <p className="text-sm text-red-600">
        Failed to load job status. Refresh and try again.
      </p>
    );
  }

  const job = statusQuery.data;
  const progress =
    job.totalRecords > 0
      ? Math.min(100, Math.round((job.totalProcessed / job.totalRecords) * 100))
      : 0;

  function exportCsv() {
    const rows =
      resultsQuery.data?.results.map((row) => ({
        email: row.email,
        is_reachable: row.isReachable,
      })) ?? [];
    CsvHelper.download(`valimail-bulk-${jobId}.csv`, CsvHelper.toCsv(rows));
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">Job {job.jobId}</CardTitle>
            <p className="text-sm text-slate-500">
              Reacher: {job.reacherJobId}
            </p>
          </div>
          <Badge
            variant={
              job.status === BulkJobStatus.COMPLETED ? "default" : "secondary"
            }
          >
            {job.status}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-2 flex justify-between text-sm text-slate-600">
              <span>
                {job.totalProcessed} / {job.totalRecords} processed
              </span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Safe", job.summary.safe],
              ["Risky", job.summary.risky],
              ["Invalid", job.summary.invalid],
              ["Unknown", job.summary.unknown],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-md border border-slate-200 px-3 py-2"
              >
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-lg font-semibold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {completed ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Results</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={exportCsv}
              disabled={!resultsQuery.data?.results.length}
            >
              Export CSV
            </Button>
          </div>

          {resultsQuery.isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div className="overflow-hidden rounded-md border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(resultsQuery.data?.results ?? []).map((row) => (
                    <TableRow key={`${row.email}-${row.isReachable}`}>
                      <TableCell className="font-mono text-sm">
                        {row.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={ReachableHelper.badgeVariant(
                            row.isReachable,
                          )}
                        >
                          {ReachableHelper.label(row.isReachable)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          Polling every 2s while job is running…
        </p>
      )}
    </div>
  );
}
