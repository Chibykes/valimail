"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppRoutes } from "@/constants/routes";
import { ApiErrorHelper } from "@/helpers/api-error";
import { ReachableHelper } from "@/helpers/reachable";
import { useCheckEmail } from "@/hooks/use-check-email";

export function HeroDemo() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const mutation = useCheckEmail();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isSignedIn) {
      router.push(AppRoutes.SIGN_IN);
      return;
    }

    try {
      await mutation.mutateAsync({ email });
    } catch (error) {
      toast.error(ApiErrorHelper.toMessage(error, "Validation failed"));
    }
  }

  return (
    <div className="w-full max-w-xl space-y-3">
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Try an email address"
          className="bg-white/90 sm:flex-1"
        />
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="bg-teal-700 hover:bg-teal-800"
        >
          {mutation.isPending
            ? "Checking…"
            : isSignedIn
              ? "Validate"
              : "Sign in to validate"}
        </Button>
      </form>

      {mutation.data ? (
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <span className="font-mono">{mutation.data.email}</span>
          <Badge variant={ReachableHelper.badgeVariant(mutation.data.isReachable)}>
            {ReachableHelper.label(mutation.data.isReachable)}
          </Badge>
        </div>
      ) : null}
    </div>
  );
}
