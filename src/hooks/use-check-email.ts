"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/constants/query-keys";
import { ApiRoutes } from "@/constants/routes";
import { apiClient } from "@/lib/api-client";
import type { CheckEmailResponse, RecentChecksResponse } from "@/types/api";

type CheckEmailVars = {
  email: string;
  sync?: boolean;
};

export function useCheckEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, sync }: CheckEmailVars) => {
      const url = sync
        ? `${ApiRoutes.CHECK_EMAIL}?sync=1`
        : ApiRoutes.CHECK_EMAIL;
      const { data } = await apiClient.post<CheckEmailResponse>(url, {
        email,
        to_email: email,
      });
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QueryKeys.recentChecks() });
    },
  });
}

export function useRecentChecks() {
  return useQuery({
    queryKey: QueryKeys.recentChecks(),
    queryFn: async () => {
      const { data } = await apiClient.get<RecentChecksResponse>(
        ApiRoutes.CHECK_EMAIL,
      );
      return data;
    },
  });
}
