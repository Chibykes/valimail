import type { Metadata } from "next";
import { CopyAgentPrompt } from "@/components/shared/copy-agent-prompt";
import { Brand } from "@/constants/brand";
import { API_DOC_ENDPOINTS, API_KEY_PLACEHOLDER } from "@/constants/api-docs";
import { API_KEY_PREFIX } from "@/constants/validation";
import { AppRoutes } from "@/constants/routes";
import Link from "next/link";

export const metadata: Metadata = {
  title: `API docs — ${Brand.NAME}`,
  description: `Validate email addresses with the ${Brand.NAME} API.`,
};

export default function DocsPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-xs font-semibold tracking-[0.16em] text-brand-600 uppercase">
        API
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
        Integrate {Brand.NAME}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        Send a key with every validation request. Create keys in the dashboard.
        The secret is shown once and cannot be fetched again.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <CopyAgentPrompt variant="default" />
        <Link
          href={AppRoutes.DASHBOARD_API}
          className="inline-flex h-8 items-center rounded-lg border border-border px-2.5 text-sm font-medium hover:bg-muted"
        >
          Manage keys
        </Link>
      </div>

      <section className="mt-12 space-y-3">
        <h2 className="font-display text-2xl font-semibold">Authentication</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Keys start with{" "}
          <code className="font-mono text-foreground">{API_KEY_PREFIX}</code>.
          Send either header. A missing, revoked, or wrongly prefixed key
          returns 401.
        </p>
        <pre className="overflow-x-auto rounded-xl border border-border bg-surface p-4 font-mono text-xs leading-relaxed">
          {`Authorization: Bearer ${API_KEY_PLACEHOLDER}
OR
x-api-key: ${API_KEY_PLACEHOLDER}`}
        </pre>
      </section>

      <section className="mt-12 space-y-8">
        <h2 className="font-display text-2xl font-semibold">Endpoints</h2>
        {API_DOC_ENDPOINTS.map((endpoint) => (
          <div key={endpoint.path + endpoint.method} className="space-y-3">
            <h3 className="text-lg font-semibold">{endpoint.title}</h3>
            <p className="font-mono text-sm">
              <span className="text-brand-600">{endpoint.method}</span>{" "}
              {endpoint.path}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {endpoint.notes}
            </p>
            {endpoint.body ? (
              <>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Request
                </p>
                <pre className="overflow-x-auto rounded-xl border border-border bg-surface p-4 font-mono text-xs leading-relaxed">
                  {endpoint.body}
                </pre>
              </>
            ) : null}
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {endpoint.status} response
            </p>
            <pre className="overflow-x-auto rounded-xl border border-border bg-surface p-4 font-mono text-xs leading-relaxed">
              {endpoint.response}
            </pre>
          </div>
        ))}
      </section>

      <section className="mt-12 space-y-3">
        <h2 className="font-display text-2xl font-semibold">Errors</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Failed requests return{" "}
          <code className="font-mono text-foreground">{`{ "error": string, "details"?: unknown }`}</code>
          . 401 means the key is missing, revoked, or does not start with{" "}
          {API_KEY_PREFIX}. 402 means the balance cannot cover the check. A
          list that does not fit is rejected whole.
        </p>
        <pre className="overflow-x-auto rounded-xl border border-border bg-surface p-4 font-mono text-xs leading-relaxed">
          {`{
  "error": "Not enough credits. This needs 500 and the balance is 120.",
  "balance": 120,
  "required": 500,
  "details": "INSUFFICIENT_CREDITS"
}`}
        </pre>
      </section>
    </article>
  );
}
