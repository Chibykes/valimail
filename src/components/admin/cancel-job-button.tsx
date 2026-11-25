"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ApiRoutes } from "@/constants/routes";
import { ErrorMessageHelper } from "@/helpers/error-message";
import { apiClient } from "@/lib/api-client";

export function CancelJobButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function cancel() {
    setPending(true);
    try {
      const { data } = await apiClient.post<{ refunded: number }>(
        ApiRoutes.adminCancelJob(jobId),
      );
      toast.success(`Cancelled. Refunded ${data.refunded.toLocaleString("en-US")} credits.`);
      router.refresh();
    } catch (error) {
      toast.error(ErrorMessageHelper.toMessage(error, "Could not cancel the list"));
    } finally {
      setPending(false);
    }
  }

  return (
    <Button type="button" variant="outline" className="h-8" disabled={pending} onClick={cancel}>
      Cancel
    </Button>
  );
}
