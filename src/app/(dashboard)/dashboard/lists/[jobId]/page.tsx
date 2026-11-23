import Link from "next/link";
import { BulkJobDetail } from "@/components/dashboard/bulk-job-detail";
import { AppRoutes } from "@/constants/routes";

type PageProps = {
  params: Promise<{ jobId: string }>;
};

export default async function BulkJobPage({ params }: PageProps) {
  const { jobId } = await params;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href={AppRoutes.DASHBOARD_LISTS}
          className="text-sm text-teal-700 hover:underline"
        >
          ← Back to lists
        </Link>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-slate-900">
          Bulk job
        </h1>
      </div>
      <BulkJobDetail jobId={jobId} />
    </div>
  );
}
