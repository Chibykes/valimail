export const ReacherPaths = {
  CHECK_EMAIL_V1: "/v1/check_email",
  CHECK_EMAIL_V0: "/v0/check_email",
  BULK: "/v1/bulk",
  bulkJob: (jobId: string) => `/v1/bulk/${jobId}`,
  bulkResults: (jobId: string) => `/v1/bulk/${jobId}/results`,
} as const;

export const ReacherHeaders = {
  SECRET: "x-reacher-secret",
} as const;

export const CheckEmailSource = {
  V0: "v0",
  V1: "v1",
} as const;

export type CheckEmailSource =
  (typeof CheckEmailSource)[keyof typeof CheckEmailSource];
