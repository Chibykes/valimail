"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AppRoutes } from "@/constants/routes";
import { CsvHelper } from "@/helpers/csv";
import { EmailHelper } from "@/helpers/email";
import { ErrorMessageHelper } from "@/helpers/error-message";
import { useCreateBulkJob } from "@/hooks/use-bulk-job";

export function BulkUploadForm() {
  const router = useRouter();
  const [raw, setRaw] = useState("");
  const createBulk = useCreateBulkJob();

  async function handleFile(file: File) {
    const text = await file.text();
    const emails = CsvHelper.parseEmailsFromText(text);
    setRaw(emails.join("\n"));
    toast.success(`Loaded ${emails.length} emails`);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const emails = EmailHelper.parseList(raw);
    const { valid, invalid } = EmailHelper.filterValid(emails);

    if (invalid.length) {
      toast.message(`Skipped ${invalid.length} invalid addresses`);
    }
    if (!valid.length) {
      toast.error("No valid emails to validate");
      return;
    }

    try {
      const job = await createBulk.mutateAsync(valid);
      toast.success("Bulk job started");
      router.push(AppRoutes.dashboardJob(job.jobId));
    } catch (error) {
      toast.error(
        ErrorMessageHelper.toMessage(error, "Failed to create bulk job"),
      );
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder="Paste emails, one per line (or comma-separated)"
        className="min-h-48 font-mono text-sm"
      />

      <div className="flex flex-wrap items-center gap-3">
        <label className="cursor-pointer text-sm text-teal-700 underline-offset-2 hover:underline">
          Upload .txt / .csv
          <input
            type="file"
            accept=".txt,.csv,text/plain,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
        </label>
        <Button
          type="submit"
          disabled={createBulk.isPending}
          className="ml-auto bg-teal-700 hover:bg-teal-800"
        >
          {createBulk.isPending ? "Starting…" : "Start bulk validation"}
        </Button>
      </div>
    </form>
  );
}
