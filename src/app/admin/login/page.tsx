"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AppRoutes, ApiRoutes } from "@/constants/routes";
import { ErrorMessageHelper } from "@/helpers/error-message";
import { apiClient } from "@/lib/api-client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await apiClient.post(ApiRoutes.ADMIN_LOGIN, { password });
      router.replace(AppRoutes.ADMIN);
      router.refresh();
    } catch (cause) {
      setError(ErrorMessageHelper.toMessage(cause, "Could not sign in"));
      setPending(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-sm"
      >
        <p className="text-xs font-semibold tracking-[0.16em] text-brand-600 uppercase">
          Admin
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">
          Sign in
        </h1>
        <label className="mt-6 block text-sm font-medium" htmlFor="admin-password">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand-300 focus:ring-3 focus:ring-brand-100"
        />
        {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
        <Button type="submit" disabled={pending || !password} className="mt-5 h-10 w-full">
          {pending ? <Loader2 className="animate-spin" /> : "Continue"}
        </Button>
      </form>
    </main>
  );
}
