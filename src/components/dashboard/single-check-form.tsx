"use client";

import { ArrowRight, Loader2, Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { EmailResultCard } from "@/components/dashboard/email-result-card";
import { Button } from "@/components/ui/button";
import { EmailHelper } from "@/helpers/email";
import { ErrorMessageHelper } from "@/helpers/error-message";
import { useCheckEmail } from "@/hooks/use-check-email";

const PREFILL_PARAM = "email";

export function SingleCheckForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(() => searchParams.get(PREFILL_PARAM) ?? "");
  const checkEmail = useCheckEmail();
  const autoRan = useRef(false);

  async function validate(value: string) {
    const normalized = EmailHelper.normalize(value);
    if (!EmailHelper.isValidSyntax(normalized)) {
      toast.error("Enter a valid email address");
      return;
    }
    try {
      await checkEmail.mutateAsync({ email: normalized });
    } catch (error) {
      toast.error(ErrorMessageHelper.toMessage(error, "Validation failed"));
    }
  }

  useEffect(() => {
    const prefill = searchParams.get(PREFILL_PARAM);
    if (prefill && !autoRan.current) {
      autoRan.current = true;
      void validate(prefill);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="space-y-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void validate(email);
        }}
        className="flex items-center gap-2 rounded-2xl border border-border bg-background p-1.5 shadow-[0_16px_50px_-20px] shadow-brand-900/20 transition focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-100"
      >
        <Mail className="ml-3 size-5 shrink-0 text-muted-foreground" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
          aria-label="Email address"
          className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/70"
        />
        <Button type="submit" disabled={checkEmail.isPending} className="h-11 rounded-xl px-5">
          {checkEmail.isPending ? (
            <>
              <Loader2 className="animate-spin" /> Checking
            </>
          ) : (
            <>
              Validate <ArrowRight />
            </>
          )}
        </Button>
      </form>
      <p className="text-xs text-muted-foreground">Each check uses 1 credit.</p>

      {checkEmail.isPending ? <PendingCard /> : null}
      {checkEmail.data && !checkEmail.isPending ? (
        <EmailResultCard key={checkEmail.data.checkId} data={checkEmail.data} />
      ) : null}
    </div>
  );
}

function PendingCard() {
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-background p-6">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="shimmer-bar h-full w-full animate-shimmer" />
      </div>
      <p className="text-sm text-muted-foreground">
        Checking format, resolving MX records and talking to the mail server…
      </p>
    </div>
  );
}
