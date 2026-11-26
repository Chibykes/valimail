import { NextRequest, NextResponse } from "next/server";
import { EnvKeys, getEnv } from "@/constants/env";
import { ApiErrorHelper } from "@/helpers/api-error";
import { verifyCryptomusSignature, type CryptomusPayment } from "@/lib/cryptomus";
import { CryptomusBilling } from "@/services/cryptomus-billing";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return ApiErrorHelper.badRequest("Invalid Cryptomus payload");
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return ApiErrorHelper.badRequest("Invalid Cryptomus payload");
  }

  const signature = typeof payload.sign === "string" ? payload.sign : "";
  if (!signature) {
    return ApiErrorHelper.unauthorized("Missing Cryptomus signature");
  }

  const valid = verifyCryptomusSignature(
    payload,
    signature,
    getEnv(EnvKeys.CRYPTOMUS_PAYMENT_API_KEY),
  );
  if (!valid) {
    console.error("[cryptomus] invalid webhook signature");
    return ApiErrorHelper.unauthorized("Invalid Cryptomus signature");
  }

  try {
    await CryptomusBilling.handleWebhook(payload as CryptomusPayment);
  } catch (error) {
    console.error("[cryptomus] webhook failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return ApiErrorHelper.json(error, 500, "Webhook failed");
  }

  return NextResponse.json({ received: true });
}
