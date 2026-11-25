import { NextRequest, NextResponse } from "next/server";
import { EnvKeys, getEnv } from "@/constants/env";
import { ApiErrorHelper } from "@/helpers/api-error";
import { getStripe } from "@/lib/stripe";
import { BillingService } from "@/services/billing";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return ApiErrorHelper.badRequest("Missing Stripe signature");
  }

  const payload = await request.text();
  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      payload,
      signature,
      getEnv(EnvKeys.STRIPE_WEBHOOK_SECRET),
    );
  } catch (error) {
    console.error("[billing] invalid webhook signature", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return ApiErrorHelper.badRequest("Invalid Stripe signature");
  }

  try {
    await BillingService.handleEvent(event);
  } catch (error) {
    console.error("[billing] webhook failed", {
      type: event.type,
      message: error instanceof Error ? error.message : "unknown",
    });
    return ApiErrorHelper.json(error, 500, "Webhook failed");
  }

  return NextResponse.json({ received: true });
}
