export const QueryKeys = {
  checkEmail: (email: string) => ["check-email", email] as const,
  recentChecks: () => ["recent-checks"] as const,
  bulkJobs: () => ["bulk-jobs"] as const,
  bulkJob: (jobId: string) => ["bulk-job", jobId] as const,
  bulkResults: (jobId: string) => ["bulk-results", jobId] as const,
} as const;
