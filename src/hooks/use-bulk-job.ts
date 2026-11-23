"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ApiRoutes } from "@/constants/routes";
import { QueryKeys } from "@/constants/query-keys";
import { BULK_POLL_INTERVAL_MS, BulkJobStatus } from "@/constants/validation";
import { apiClient } from "@/lib/api-client";
import type {
  BulkJobStatusResponse,
  BulkResultsResponse,
  CreateBulkResponse,
} from "@/types/api";

export function useCreateBulkJob() {
  return useMutation({
    mutationFn: async (emails: string[]) => {
      const { data } = await apiClient.post<CreateBulkResponse>(ApiRoutes.BULK, {
        input: emails,
      });
      return data;
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
      if (!status || status === BulkJobStatus.COMPLETED) return false;
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
