import { ListChecks } from "lucide-react";
import { BulkComposer } from "@/components/dashboard/bulk-composer";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { MyLists } from "@/components/dashboard/my-lists";

export default function DashboardListsPage() {
  return (
    <>
      <DashboardHero
        icon={ListChecks}
        title="List validation"
        description="Validate multiple email addresses at once and export the results"
      >
        <BulkComposer />
      </DashboardHero>
      <MyLists />
    </>
  );
}
