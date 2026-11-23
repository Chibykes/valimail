"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/constants/query-keys";
import { ApiRoutes } from "@/constants/routes";
import { apiClient } from "@/lib/api-client";
import type { ApiKeyCreatedResponse, ApiKeyListResponse, ApiKeyRecord } from "@/types/api";

export function useApiKeys() {
  return useQuery({
    queryKey: QueryKeys.apiKeys(),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiKeyListResponse>(ApiRoutes.API_KEYS);
      return data;
    },
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await apiClient.post<ApiKeyCreatedResponse>(ApiRoutes.API_KEYS, {
        name,
      });
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QueryKeys.apiKeys() });
    },
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<ApiKeyRecord>(ApiRoutes.revokeApiKey(id));
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QueryKeys.apiKeys() });
    },
  });
}
