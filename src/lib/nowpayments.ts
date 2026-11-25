import { createHmac, timingSafeEqual } from "node:crypto";
import { EnvKeys, getEnv, getOptionalEnv } from "@/constants/env";

const DEFAULT_API_BASE = "https://api.nowpayments.io/v1";

export type NowPayment = {
  payment_id?: string | number;
  parent_payment_id?: string | number | null;
  invoice_id?: string | number | null;
  payment_status?: string;
  price_amount?: string | number;
  price_currency?: string;
  order_id?: string | null;
};

type InvoiceResponse = {
  id: string | number;
  invoice_url: string;
};

let cachedToken: { value: string; expiresAt: number } | undefined;

export function nowPaymentsApiBase(): string {
  return getOptionalEnv(EnvKeys.NOWPAYMENTS_API_BASE) ?? DEFAULT_API_BASE;
}

export function verifyNowPaymentsSignature(
  body: unknown,
  signature: string,
  secret: string,
): boolean {
  const digest = createHmac("sha512", secret)
    .update(JSON.stringify(sortObject(body)))
    .digest("hex");
  const left = Buffer.from(digest);
  const right = Buffer.from(signature);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export class NowPaymentsClient {
  static async createInvoice(body: {
    price_amount: number;
    price_currency: "usd";
    order_id: string;
    order_description: string;
    ipn_callback_url: string;
    success_url: string;
    cancel_url: string;
    is_fixed_rate: true;
    is_fee_paid_by_user: false;
  }): Promise<InvoiceResponse> {
    return apiRequest<InvoiceResponse>("/invoice", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  static async listInvoicePayments(invoiceId: string): Promise<NowPayment[]> {
    const token = await authToken();
    const payload = await apiRequest<unknown>(
      `/payment/?invoiceid=${encodeURIComponent(invoiceId)}&limit=100`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return paymentsFrom(payload);
  }
}

async function authToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now) return cachedToken.value;

  const payload = await apiRequest<{ token?: string }>("/auth", {
    method: "POST",
    body: JSON.stringify({
      email: getEnv(EnvKeys.NOWPAYMENTS_EMAIL),
      password: getEnv(EnvKeys.NOWPAYMENTS_PASSWORD),
    }),
  });
  if (!payload.token) {
    throw new Error("NOWPayments did not return an auth token");
  }
  cachedToken = { value: payload.token, expiresAt: now + 4 * 60 * 1000 };
  return payload.token;
}

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  headers.set("x-api-key", getEnv(EnvKeys.NOWPAYMENTS_API_KEY));
  const response = await fetch(`${nowPaymentsApiBase()}${path}`, {
    ...init,
    headers,
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`NOWPayments ${response.status}: ${text.slice(0, 300)}`);
  }
  return (text ? JSON.parse(text) : {}) as T;
}

function paymentsFrom(payload: unknown): NowPayment[] {
  if (Array.isArray(payload)) return payload as NowPayment[];
  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as { data?: unknown }).data;
    if (Array.isArray(data)) return data as NowPayment[];
  }
  return [];
}

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        result[key] = sortObject((value as Record<string, unknown>)[key]);
        return result;
      }, {});
  }
  return value;
}
