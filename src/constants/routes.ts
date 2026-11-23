export const AppRoutes = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  DASHBOARD: "/dashboard",
  DASHBOARD_SINGLE: "/dashboard/single",
  DASHBOARD_LISTS: "/dashboard/lists",
  dashboardJob: (jobId: string) => `/dashboard/lists/${jobId}`,
} as const;

export const ApiRoutes = {
  CHECK_EMAIL: "/api/v1/check-email",
  BULK: "/api/v1/bulk",
  bulkJob: (jobId: string) => `/api/v1/bulk/${jobId}`,
  bulkResults: (jobId: string) => `/api/v1/bulk/${jobId}/results`,
} as const;
