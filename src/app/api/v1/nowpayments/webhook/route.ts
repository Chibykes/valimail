import { NextRequest, NextResponse } from "next/server";
import { EnvKeys, getEnv } from "@/constants/env";
import { ApiErrorHelper } from "@/helpers/api-error";
import { verifyNowPaymentsSignature, type NowPayment } from "@/lib/nowpayments";
import { NowPaymentsBilling } from "@/services/nowpayments-billing";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-nowpayments-sig");
  if (!signature) {
    return ApiErrorHelper.unauthorized("Missing NOWPayments signature");
  }

  let payment: NowPayment;
  try {
    payment = (await request.json()) as NowPayment;
  } catch {
    return ApiErrorHelper.badRequest("Invalid NOWPayments payload");
  }

  const valid = verifyNowPaymentsSignature(
    payment,
    signature,
    getEnv(EnvKeys.NOWPAYMENTS_IPN_SECRET),
  );
  if (!valid) {
    console.error("[nowpayments] invalid webhook signature");
    return ApiErrorHelper.unauthorized("Invalid NOWPayments signature");
  }

  try {
    await NowPaymentsBilling.handleIpn(payment);
  } catch (error) {
    console.error("[nowpayments] webhook failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return ApiErrorHelper.json(error, 500, "Webhook failed");
  }

  return NextResponse.json({ received: true });
}
