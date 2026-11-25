"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiRoutes } from "@/constants/routes";
import { QueryKeys } from "@/constants/query-keys";
import { apiClient } from "@/lib/api-client";
import type {
  BillingAccountResponse,
  CheckoutConfirmResponse,
  CheckoutResponse,
} from "@/types/api";

export function useBillingAccount(options?: { poll?: boolean }) {
  return useQuery({
    queryKey: QueryKeys.billing(),
    queryFn: async () => {
      const { data } = await apiClient.get<BillingAccountResponse>(ApiRoutes.BILLING);
      return data;
    },
    refetchInterval: options?.poll ? 3000 : false,
  });
}

export function useConfirmCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data } = await apiClient.post<CheckoutConfirmResponse>(
        ApiRoutes.BILLING_CONFIRM,
        { sessionId },
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<BillingAccountResponse>(QueryKeys.billing(), (current) =>
        current ? { ...current, balance: data.balance } : current,
      );
      void queryClient.invalidateQueries({ queryKey: QueryKeys.billing() });
    },
  });
}

export function useCheckout() {
  return useMutation({
    mutationFn: async (planId: string) => {
      const { data } = await apiClient.post<CheckoutResponse>(
        ApiRoutes.BILLING_CHECKOUT,
        { planId },
      );
      return data;
    },
    onSuccess: (data) => {
      window.location.assign(data.url);
    },
  });
}
