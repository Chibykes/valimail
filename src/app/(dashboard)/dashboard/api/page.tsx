import { KeyRound } from "lucide-react";
import { ApiKeysPanel } from "@/components/dashboard/api-keys-panel";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";

export default function DashboardApiPage() {
  return (
    <DashboardHero
      icon={KeyRound}
      title="API keys"
      description="Create keys for servers and agents that validate email outside the dashboard"
    >
      <ApiKeysPanel />
    </DashboardHero>
  );
}
