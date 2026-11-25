"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiRoutes } from "@/constants/routes";
import { QueryKeys } from "@/constants/query-keys";
import { BULK_POLL_INTERVAL_MS, BulkJobStatus } from "@/constants/validation";
import { apiClient } from "@/lib/api-client";
import type {
  BulkJobListResponse,
  BulkJobStatusResponse,
  BulkResultsResponse,
  CreateBulkResponse,
} from "@/types/api";

type CreateBulkVars = {
  emails: string[];
  name?: string;
};

export function useBulkJobs() {
  return useQuery({
    queryKey: QueryKeys.bulkJobs(),
    queryFn: async () => {
      const { data } = await apiClient.get<BulkJobListResponse>(ApiRoutes.BULK);
      return data;
    },
    refetchInterval: (query) => {
      const running = query.state.data?.jobs.some(
        (job) =>
          job.status === BulkJobStatus.PENDING || job.status === BulkJobStatus.RUNNING,
      );
      return running ? BULK_POLL_INTERVAL_MS * 3 : false;
    },
  });
}

export function useCreateBulkJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ emails, name }: CreateBulkVars) => {
      const { data } = await apiClient.post<CreateBulkResponse>(ApiRoutes.BULK, {
        input: emails,
        name,
      });
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QueryKeys.bulkJobs() });
      void queryClient.invalidateQueries({ queryKey: QueryKeys.billing() });
    },
  });
}

export function useBulkJobStatus(jobId: string | undefined) {
  return useQuery({
    queryKey: QueryKeys.bulkJob(jobId ?? ""),
    enabled: Boolean(jobId),
    queryFn: async () => {
      const { data } = await apiClient.get<BulkJobStatusResponse>(
        ApiRoutes.bulkJob(jobId!),
      );
      return data;
    },
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (
        !status ||
        (status !== BulkJobStatus.PENDING && status !== BulkJobStatus.RUNNING)
      ) {
        return false;
      }
      return BULK_POLL_INTERVAL_MS;
    },
  });
}

export function useBulkJobResults(
  jobId: string | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: QueryKeys.bulkResults(jobId ?? ""),
    enabled: Boolean(jobId) && enabled,
    queryFn: async () => {
      const { data } = await apiClient.get<BulkResultsResponse>(
        ApiRoutes.bulkResults(jobId!),
      );
      return data;
    },
  });
}
