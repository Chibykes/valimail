import { AxiosHttpClient } from "@/adapters/http/axios-http-client";
import type { EmailValidationAdapter } from "@/adapters/email-validation/email-validation.interface";
import { ReacherEmailValidationAdapter } from "@/adapters/email-validation/reacher-email-validation.adapter";
import {
  getReacherBaseUrl,
  getReacherHeaderSecret,
} from "@/constants/env";
import { ReacherHeaders } from "@/constants/reacher";

let emailValidationAdapter: EmailValidationAdapter | null = null;

export function createEmailValidationAdapter(): EmailValidationAdapter {
  const headers: Record<string, string> = {};
  const secret = getReacherHeaderSecret();
  if (secret) {
    headers[ReacherHeaders.SECRET] = secret;
  }

  const baseURL = getReacherBaseUrl();
  console.info("[reacher] client", {
    baseURL,
    secretHeader: Boolean(secret),
  });
  const http = new AxiosHttpClient(baseURL, headers);
  return new ReacherEmailValidationAdapter(http);
}

export function getEmailValidationAdapter(): EmailValidationAdapter {
  if (!emailValidationAdapter) {
    emailValidationAdapter = createEmailValidationAdapter();
  }
  return emailValidationAdapter;
}

export function setEmailValidationAdapter(
  adapter: EmailValidationAdapter,
): void {
  emailValidationAdapter = adapter;
}
