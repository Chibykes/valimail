import { NextRequest, NextResponse } from "next/server";
import { ApiErrorHelper } from "@/helpers/api-error";
import { AuthError, requireAuth } from "@/lib/auth/protect";
import { BillingService } from "@/services/billing";
import { CryptomusBilling } from "@/services/cryptomus-billing";

export async function POST(request: NextRequest) {
  try {
    const authContext = await requireAuth();
    const body = (await request.json()) as { planId?: unknown };
    if (typeof body.planId !== "string" || !body.planId.trim()) {
      return ApiErrorHelper.badRequest("planId is required");
    }

    const result = await CryptomusBilling.checkout({
      clerkId: authContext.clerkId,
      emailAddress: authContext.email,
      planId: body.planId,
      origin: BillingService.origin(request),
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return ApiErrorHelper.unauthorized(error.message);
    }
    if (error instanceof Error && error.message === "Unknown plan") {
      return ApiErrorHelper.badRequest(error.message);
    }
    return ApiErrorHelper.json(error, 500, "Failed to start checkout");
  }
}
