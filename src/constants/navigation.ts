import { AppRoutes, MarketingAnchors } from "@/constants/routes";

export const DashboardNavKey = {
  LISTS: "lists",
  SINGLE: "single",
} as const;

export type DashboardNavKey =
  (typeof DashboardNavKey)[keyof typeof DashboardNavKey];

export const DASHBOARD_NAV = [
  { key: DashboardNavKey.LISTS, label: "Lists", href: AppRoutes.DASHBOARD_LISTS },
  { key: DashboardNavKey.SINGLE, label: "Single", href: AppRoutes.DASHBOARD_SINGLE },
] as const;

export const MARKETING_NAV = [
  { label: "Features", href: MarketingAnchors.FEATURES },
  { label: "Use cases", href: MarketingAnchors.USE_CASES },
  { label: "Reliability", href: MarketingAnchors.RELIABILITY },
  { label: "FAQ", href: MarketingAnchors.FAQ },
] as const;
