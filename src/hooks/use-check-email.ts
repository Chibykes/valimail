"use client";

import { useMutation } from "@tanstack/react-query";
import { ApiRoutes } from "@/constants/routes";
import { apiClient } from "@/lib/api-client";
import type { CheckEmailResponse } from "@/types/api";

type CheckEmailVars = {
  email: string;
  sync?: boolean;
};

export function useCheckEmail() {
  return useMutation({
    mutationFn: async ({ email, sync }: CheckEmailVars) => {
      const url = sync
        ? `${ApiRoutes.CHECK_EMAIL}?sync=1`
        : ApiRoutes.CHECK_EMAIL;
      const { data } = await apiClient.post<CheckEmailResponse>(url, { email, to_email: email });
      return data;
    },
  });
}
