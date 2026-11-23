import { redirect } from "next/navigation";
import { AppRoutes } from "@/constants/routes";

export default function DashboardIndexPage() {
  redirect(AppRoutes.DASHBOARD_SINGLE);
}
