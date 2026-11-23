import { MailCheck } from "lucide-react";
import { Suspense } from "react";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { RecentChecks } from "@/components/dashboard/recent-checks";
import { SingleCheckForm } from "@/components/dashboard/single-check-form";

export default function DashboardSinglePage() {
  return (
    <>
      <DashboardHero
        icon={MailCheck}
        title="Single email validation"
        description="Validate a single email address and get details about the result"
      >
        <Suspense fallback={null}>
          <SingleCheckForm />
        </Suspense>
      </DashboardHero>
      <RecentChecks />
    </>
  );
}
