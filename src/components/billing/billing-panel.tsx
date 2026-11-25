"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { CREDIT_REASON_LABELS, type CreditReason } from "@/constants/billing";
import { ErrorMessageHelper } from "@/helpers/error-message";
import { useBillingAccount, useConfirmCheckout } from "@/hooks/use-billing";
import type { CheckoutConfirmStatus } from "@/types/api";

const CONFIRM_TOAST: Record<
  CheckoutConfirmStatus,
  { type: "success" | "error" | "message"; message: string }
> = {
  granted: { type: "success", message: "Payment confirmed. Credits added." },
  already_credited: { type: "success", message: "This payment is already on your balance." },
  pending: {
    type: "message",
    message: "Payment received. Credits appear when the network confirms.",
  },
  unpaid: { type: "error", message: "Stripe has not marked this payment as paid." },
  ignored: { type: "error", message: "This payment could not be matched to a credit pack." },
};

export function CheckoutNotice() {
  const params = useSearchParams();
  const started = useRef(false);
  const confirm = useConfirmCheckout();

  useEffect(() => {
    if (started.current) return;
    if (params.get("checkout") !== "success") return;
    const sessionId = params.get("session_id") ?? params.get("invoice_id");
    if (!sessionId) return;
    started.current = true;
    confirm.mutate(sessionId, {
      onSuccess: (data) => {
        const notice = CONFIRM_TOAST[data.status];
        if (notice.type === "message") toast.message(notice.message);
        else toast[notice.type](notice.message);
      },
      onError: (error) => {
        toast.error(ErrorMessageHelper.toMessage(error, "Could not confirm the payment"));
      },
    });
  }, [confirm, params]);

  return null;
}

export function BalanceHeader() {
  const params = useSearchParams();
  const poll = params.get("checkout") === "success";
  const { data, isLoading } = useBillingAccount({ poll });
  const balance = data?.balance ?? 0;

  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.16em] text-brand-600 uppercase">
        Balance
      </p>
      <p className="mt-2 font-display text-5xl font-semibold tracking-tight tabular-nums">
        {isLoading ? "—" : balance.toLocaleString("en-US")}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        credits left. One credit validates one address.
      </p>
    </div>
  );
}

export function CreditLedger() {
  const { data, isLoading, isError } = useBillingAccount();
  const entries = data?.entries ?? [];

  return (
    <section>
      <h2 className="font-display text-lg font-semibold">Activity</h2>
      {isLoading ? (
        <p className="mt-3 text-sm text-muted-foreground">Loading activity…</p>
      ) : isError ? (
        <p className="mt-3 text-sm text-rose-600">Couldn&apos;t load credit activity.</p>
      ) : entries.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No credit activity yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border/70 rounded-2xl border border-border">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <p className="text-sm font-medium">{reasonLabel(entry.reason)}</p>
                <p className="text-xs text-muted-foreground">
                  Balance {entry.balanceAfter.toLocaleString("en-US")}
                </p>
              </div>
              <p
                className={
                  entry.delta >= 0
                    ? "text-sm font-medium text-emerald-700 tabular-nums"
                    : "text-sm font-medium tabular-nums"
                }
              >
                {entry.delta > 0 ? "+" : ""}
                {entry.delta.toLocaleString("en-US")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function reasonLabel(reason: string) {
  if (reason in CREDIT_REASON_LABELS) {
    return CREDIT_REASON_LABELS[reason as CreditReason];
  }
  return reason;
}
