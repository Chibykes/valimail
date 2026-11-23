import { SingleCheckForm } from "@/components/dashboard/single-check-form";

export default function DashboardSinglePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-slate-900">
          Single validation
        </h1>
        <p className="mt-1 text-slate-600">
          Check one email for syntax, MX, SMTP, and misc signals.
        </p>
      </div>
      <SingleCheckForm />
    </div>
  );
}
