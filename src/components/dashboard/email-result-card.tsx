"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { ResultPanel } from "@/components/shared/result-panel";
import { Button } from "@/components/ui/button";
import { ReachableHelper } from "@/helpers/reachable";
import { ResultSignalsHelper } from "@/helpers/result-signals";
import type { CheckEmailResponse } from "@/types/api";

export function EmailResultCard({ data }: { data: CheckEmailResponse }) {
  const { result } = data;
  const records = result.mx?.records ?? [];

  async function copyJson() {
    await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    toast.success("Raw result copied");
  }

  return (
    <div className="grid animate-fade-up gap-4 md:grid-cols-[1.4fr_1fr]">
      <div className="rounded-2xl border border-border bg-background p-6">
        <ResultPanel
          data={{
            email: data.email,
            status: data.isReachable,
            score: ReachableHelper.score(result),
            signals: ResultSignalsHelper.fromResult(result),
          }}
        />
      </div>

      <div className="space-y-4">
        <DetailCard title="Address">
          <DetailRow label="Username" value={result.syntax?.username ?? "—"} />
          <DetailRow label="Domain" value={result.syntax?.domain ?? "—"} />
        </DetailCard>

        <DetailCard title={`Mail servers · ${records.length}`}>
          {records.length ? (
            <ul className="space-y-1.5">
              {records.slice(0, 5).map((record) => (
                <li key={record} className="truncate font-mono text-xs text-muted-foreground">
                  {record}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">No MX records found</p>
          )}
        </DetailCard>

        <DetailCard title="Verification">
          <DetailRow label="Engine" value={`Reacher ${data.source.toUpperCase()}`} />
          <DetailRow label="Check ID" value={data.checkId.slice(0, 10)} mono />
          <Button variant="outline" size="sm" className="mt-2 w-full" onClick={copyJson}>
            <Copy /> Copy raw JSON
          </Button>
        </DetailCard>
      </div>
    </div>
  );
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <p className="mb-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        {title}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "truncate font-mono text-xs" : "truncate font-medium"}>{value}</span>
    </div>
  );
}
