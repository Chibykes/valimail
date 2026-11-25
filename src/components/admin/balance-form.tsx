"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ADMIN_NOTE_MAX_LENGTH } from "@/constants/admin";
import { ApiRoutes } from "@/constants/routes";
import { ErrorMessageHelper } from "@/helpers/error-message";
import { apiClient } from "@/lib/api-client";

export function BalanceForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [delta, setDelta] = useState("");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      await apiClient.post(ApiRoutes.adminBalance(userId), {
        delta: Number(delta),
        note,
      });
      setDelta("");
      setNote("");
      toast.success("Balance updated");
      router.refresh();
    } catch (error) {
      toast.error(ErrorMessageHelper.toMessage(error, "Could not update balance"));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
      <input
        value={delta}
        onChange={(event) => setDelta(event.target.value)}
        inputMode="numeric"
        placeholder="+500"
        aria-label="Credit delta"
        className="h-8 w-full rounded-lg border border-border bg-background px-2 text-sm outline-none focus:border-brand-300 sm:w-24"
      />
      <input
        value={note}
        onChange={(event) => setNote(event.target.value)}
        maxLength={ADMIN_NOTE_MAX_LENGTH}
        placeholder="Note"
        aria-label="Adjustment note"
        className="h-8 w-full rounded-lg border border-border bg-background px-2 text-sm outline-none focus:border-brand-300 sm:w-40"
      />
      <Button type="submit" disabled={pending || !delta || !note.trim()} className="h-8">
        Apply
      </Button>
    </form>
  );
}
