"use client";

import { Check, Copy, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { CopyAgentPrompt } from "@/components/shared/copy-agent-prompt";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { API_KEY_PLACEHOLDER } from "@/constants/api-docs";
import { AppRoutes } from "@/constants/routes";
import { MAX_API_KEY_NAME_LENGTH } from "@/constants/validation";
import { DateHelper } from "@/helpers/date";
import { ErrorMessageHelper } from "@/helpers/error-message";
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from "@/hooks/use-api-keys";
import { cn } from "@/lib/utils";

export function ApiKeysPanel() {
  const { data, isLoading, isError } = useApiKeys();
  const createKey = useCreateApiKey();
  const revokeKey = useRevokeApiKey();
  const [name, setName] = useState("");
  const [revealed, setRevealed] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function onCreate() {
    try {
      const created = await createKey.mutateAsync(name);
      setName("");
      setRevealed(created.key);
      setCopied(false);
    } catch (error) {
      toast.error(ErrorMessageHelper.toMessage(error, "Couldn't create that key"));
    }
  }

  async function copySecret() {
    if (!revealed) return;
    try {
      await navigator.clipboard.writeText(revealed);
      setCopied(true);
      toast.success("API key copied");
    } catch {
      toast.error("Couldn't copy the key");
    }
  }

  async function onRevoke(id: string) {
    try {
      await revokeKey.mutateAsync(id);
      toast.success("Key revoked");
    } catch (error) {
      toast.error(ErrorMessageHelper.toMessage(error, "Couldn't revoke that key"));
    }
  }

  const keys = data?.keys ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <Button variant="outline" asChild>
          <Link href={AppRoutes.DOCS}>API docs</Link>
        </Button>
        <CopyAgentPrompt />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-[0_16px_50px_-20px] shadow-brand-900/20">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={MAX_API_KEY_NAME_LENGTH}
            placeholder="Production server"
            aria-label="API key name"
            className="h-12 w-full rounded-lg border border-border bg-background px-3.5 text-base outline-none focus:border-brand-300 focus:ring-3 focus:ring-brand-100 sm:h-9 sm:w-auto sm:flex-1 sm:px-3 sm:text-sm"
          />
          <Button
            onClick={() => void onCreate()}
            disabled={!name.trim() || createKey.isPending}
            className="h-12 w-full rounded-lg px-4 text-base sm:h-9 sm:w-auto sm:text-sm"
          >
            {createKey.isPending ? "Creating…" : "Create key"}
          </Button>
        </div>
        <p className="border-t border-border bg-surface/70 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          The secret is shown once. Requests use
          <code className="mt-1 block font-mono break-words">
            Authorization: Bearer {API_KEY_PLACEHOLDER}
          </code>
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1].map((item) => (
            <Skeleton key={item} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-rose-600">Couldn&apos;t load your keys. Refresh to try again.</p>
      ) : keys.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          No keys yet. Name one and create it.
        </p>
      ) : (
        <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border">
          {keys.map((key) => {
            const revoked = Boolean(key.revokedAt);
            return (
              <li
                key={key.id}
                className={cn(
                  "flex items-center gap-4 bg-background px-4 py-3.5",
                  revoked && "opacity-60",
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{key.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {key.prefix}…
                  </p>
                </div>
                <div className="hidden text-right text-xs text-muted-foreground sm:block">
                  <p>{DateHelper.relativeDay(key.createdAt)}</p>
                  <p>
                    {key.lastUsedAt
                      ? `Used ${DateHelper.relativeDay(key.lastUsedAt)}`
                      : "Never used"}
                  </p>
                </div>
                {revoked ? (
                  <span className="text-xs font-medium text-muted-foreground">Revoked</span>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={revokeKey.isPending}
                    onClick={() => void onRevoke(key.id)}
                  >
                    Revoke
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {revealed ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-brand-950/40 p-5">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="api-key-reveal-title"
            className="w-full max-w-lg rounded-2xl border border-border bg-background p-5 shadow-xl"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 id="api-key-reveal-title" className="font-display text-lg font-semibold">
                  Copy your key
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  This is the only time the full secret is shown.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Close"
                onClick={() => {
                  setRevealed(null);
                  setCopied(false);
                }}
              >
                <X />
              </Button>
            </div>
            <code className="block overflow-x-auto rounded-xl border border-border bg-surface px-3 py-3 font-mono text-xs break-all">
              {revealed}
            </code>
            <Button className="mt-4 h-9" onClick={() => void copySecret()}>
              {copied ? <Check /> : <Copy />}
              {copied ? "Copied" : "Copy key"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
