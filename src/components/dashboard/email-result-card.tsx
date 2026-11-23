"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ReachableHelper } from "@/helpers/reachable";
import type { CheckEmailResponse } from "@/types/api";

type Props = {
  data: CheckEmailResponse;
};

export function EmailResultCard({ data }: Props) {
  const status = ReachableHelper.normalize(data.isReachable);
  const { result } = data;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="font-display text-xl text-slate-900">
              {data.email}
            </CardTitle>
            <CardDescription>
              Source {data.source.toUpperCase()} · check {data.checkId.slice(0, 8)}
            </CardDescription>
          </div>
          <Badge variant={ReachableHelper.badgeVariant(status)}>
            {ReachableHelper.label(status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-700">
        <DetailBlock
          title="Syntax"
          items={[
            ["Valid", String(result.syntax?.is_valid_syntax ?? "—")],
            ["Username", result.syntax?.username ?? "—"],
            ["Domain", result.syntax?.domain ?? "—"],
          ]}
        />
        <Separator />
        <DetailBlock
          title="MX"
          items={[
            ["Accepts mail", String(result.mx?.accepts_mail ?? "—")],
            ["Records", (result.mx?.records ?? []).join(", ") || "—"],
          ]}
        />
        <Separator />
        <DetailBlock
          title="SMTP"
          items={[
            ["Deliverable", String(result.smtp?.is_deliverable ?? "—")],
            ["Can connect", String(result.smtp?.can_connect_smtp ?? "—")],
            ["Catch-all", String(result.smtp?.is_catch_all ?? "—")],
            ["Disabled", String(result.smtp?.is_disabled ?? "—")],
          ]}
        />
        <Separator />
        <DetailBlock
          title="Misc"
          items={[
            ["Disposable", String(result.misc?.is_disposable ?? "—")],
            ["Role account", String(result.misc?.is_role_account ?? "—")],
            ["Bounced", String(result.misc?.is_bounced ?? "—")],
          ]}
        />
      </CardContent>
    </Card>
  );
}

function DetailBlock({
  title,
  items,
}: {
  title: string;
  items: [string, string][];
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
        {title}
      </h3>
      <dl className="grid gap-2 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-md bg-slate-50 px-3 py-2">
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="font-medium break-all text-slate-800">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
