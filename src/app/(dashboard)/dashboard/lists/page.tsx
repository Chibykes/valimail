import { BulkUploadForm } from "@/components/dashboard/bulk-upload-form";

export default function DashboardListsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-slate-900">
          Bulk lists
        </h1>
        <p className="mt-1 text-slate-600">
          Paste emails or upload a .txt / .csv file to start a bulk job.
        </p>
      </div>
      <BulkUploadForm />
    </div>
  );
}
