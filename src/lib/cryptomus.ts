import { createHash, timingSafeEqual } from "node:crypto";
import { EnvKeys, getEnv, getOptionalEnv } from "@/constants/env";

const DEFAULT_API_BASE = "https://api.cryptomus.com/v1";

export type CryptomusPayment = {
  uuid?: string;
  order_id?: string | null;
  amount?: string | number | null;
  payment_amount_usd?: string | number | null;
  currency?: string | null;
  status?: string;
  payment_status?: string;
  is_final?: boolean;
  sign?: string;
};

type InvoiceResult = {
  uuid?: string;
  url?: string;
  status?: string;
  payment_status?: string;
};

type ApiEnvelope<T> = {
  state?: number;
  message?: string;
  result?: T;
};

export function cryptomusApiBase(): string {
  return getOptionalEnv(EnvKeys.CRYPTOMUS_API_BASE) ?? DEFAULT_API_BASE;
}

/** PHP json_encode escapes slashes. Cryptomus signs that form. */
export function cryptomusJson(value: unknown): string {
  return JSON.stringify(value).replace(/\//g, "\\/");
}

export function cryptomusSign(json: string, apiKey: string): string {
  const base64 = Buffer.from(json, "utf8").toString("base64");
  return createHash("md5").update(base64 + apiKey).digest("hex");
}

export function verifyCryptomusSignature(
  body: Record<string, unknown>,
  signature: string,
  apiKey: string,
): boolean {
  if (!signature) return false;
  const payload = { ...body };
  delete payload.sign;
  const encoded = cryptomusSign(cryptomusJson(payload), apiKey);
  const plain = cryptomusSign(JSON.stringify(payload), apiKey);
  return safeEqual(encoded, signature) || safeEqual(plain, signature);
}

export class CryptomusClient {
  static async createInvoice(body: {
    amount: string;
    currency: "USD";
    order_id: string;
    url_callback?: string;
    url_success: string;
    url_return: string;
    is_payment_multiple: false;
  }): Promise<InvoiceResult> {
    return apiRequest<InvoiceResult>("/payment", body);
  }

  static async paymentInfo(orderId: string): Promise<CryptomusPayment> {
    return apiRequest<CryptomusPayment>("/payment/info", { order_id: orderId });
  }
}

async function apiRequest<T>(path: string, payload: Record<string, unknown>): Promise<T> {
  const body = cryptomusJson(payload);
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("merchant", getEnv(EnvKeys.CRYPTOMUS_MERCHANT_ID));
  headers.set("sign", cryptomusSign(body, getEnv(EnvKeys.CRYPTOMUS_PAYMENT_API_KEY)));

  const response = await fetch(`${cryptomusApiBase()}${path}`, {
    method: "POST",
    headers,
    body,
  });
  const text = await response.text();
  let parsed: ApiEnvelope<T> = {};
  try {
    parsed = text ? (JSON.parse(text) as ApiEnvelope<T>) : {};
  } catch {
    parsed = {};
  }
  if (!response.ok || parsed.state !== 0 || parsed.result === undefined) {
    const message = parsed.message || text.slice(0, 300);
    throw new Error(`Cryptomus ${response.status}: ${message}`);
  }
  return parsed.result;
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
