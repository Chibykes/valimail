export const AppRoutes = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  DASHBOARD: "/dashboard",
  DASHBOARD_SINGLE: "/dashboard/single",
  DASHBOARD_LISTS: "/dashboard/lists",
  DASHBOARD_API: "/dashboard/api",
  DASHBOARD_BILLING: "/dashboard/billing",
  PRICING: "/pricing",
  DOCS: "/docs",
  ADMIN: "/admin",
  ADMIN_LOGIN: "/admin/login",
  ADMIN_USERS: "/admin/users",
  ADMIN_JOBS: "/admin/jobs",
  dashboardJob: (jobId: string) => `/dashboard/lists/${jobId}`,
} as const;

export const AuthRedirects = {
  AFTER_SIGN_IN: AppRoutes.DASHBOARD,
  AFTER_SIGN_UP: AppRoutes.DASHBOARD,
  AFTER_SIGN_OUT: AppRoutes.HOME,
} as const;

export const MarketingAnchors = {
  FEATURES: "#features",
  USE_CASES: "#use-cases",
  RELIABILITY: "#reliability",
  FAQ: "#faq",
} as const;

export const ApiRoutes = {
  CHECK_EMAIL: "/api/v1/check-email",
  BULK: "/api/v1/bulk",
  API_KEYS: "/api/v1/api-keys",
  BILLING: "/api/v1/billing",
  BILLING_CHECKOUT: "/api/v1/billing/checkout",
  BILLING_CONFIRM: "/api/v1/billing/confirm",
  NOWPAYMENTS_WEBHOOK: "/api/v1/nowpayments/webhook",
  CRYPTOMUS_WEBHOOK: "/api/v1/cryptomus/webhook",
  ADMIN_LOGIN: "/api/admin/login",
  ADMIN_LOGOUT: "/api/admin/logout",
  adminBalance: (userId: string) => `/api/admin/users/${userId}/balance`,
  adminCancelJob: (jobId: string) => `/api/admin/jobs/${jobId}/cancel`,
  bulkJob: (jobId: string) => `/api/v1/bulk/${jobId}`,
  bulkResults: (jobId: string) => `/api/v1/bulk/${jobId}/results`,
  revokeApiKey: (id: string) => `/api/v1/api-keys/${id}/revoke`,
} as const;
