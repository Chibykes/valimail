"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmailResultCard } from "@/components/dashboard/email-result-card";
import { EmailHelper } from "@/helpers/email";
import { ErrorMessageHelper } from "@/helpers/error-message";
import { useCheckEmail } from "@/hooks/use-check-email";

export function SingleCheckForm() {
  const [email, setEmail] = useState("");
  const checkEmail = useCheckEmail();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const normalized = EmailHelper.normalize(email);
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

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 flex-1"
        />
        <Button type="submit" disabled={checkEmail.isPending} className="h-11 bg-teal-700 hover:bg-teal-800">
          {checkEmail.isPending ? "Checking…" : "Validate"}
        </Button>
      </form>

      {checkEmail.data ? <EmailResultCard data={checkEmail.data} /> : null}
    </div>
  );
}
