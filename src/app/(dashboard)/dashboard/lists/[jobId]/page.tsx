import { BulkJobDetail } from "@/components/dashboard/bulk-job-detail";

type PageProps = {
  params: Promise<{ jobId: string }>;
};

export default async function BulkJobPage({ params }: PageProps) {
  const { jobId } = await params;
  return <BulkJobDetail jobId={jobId} />;
}
