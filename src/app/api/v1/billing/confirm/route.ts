import { NextRequest, NextResponse } from "next/server";
import { ApiErrorHelper } from "@/helpers/api-error";
import { AuthError, requireAuth } from "@/lib/auth/protect";
import { BillingService, CheckoutOwnershipError } from "@/services/billing";

export async function POST(request: NextRequest) {
  try {
    const authContext = await requireAuth();
    const body = (await request.json()) as { sessionId?: unknown };
    if (typeof body.sessionId !== "string" || !body.sessionId.trim()) {
      return ApiErrorHelper.badRequest("sessionId is required");
    }

    const result = await BillingService.confirmCheckout({
      clerkId: authContext.clerkId,
      emailAddress: authContext.email,
      sessionId: body.sessionId.trim(),
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return ApiErrorHelper.unauthorized(error.message);
    }
    if (error instanceof CheckoutOwnershipError) {
      return ApiErrorHelper.response(403, error.message);
    }
    if (error instanceof Error && error.message === "Invalid checkout session") {
      return ApiErrorHelper.badRequest(error.message);
    }
    if (isMissingCheckoutSession(error)) {
      return ApiErrorHelper.badRequest("Checkout session not found");
    }
    return ApiErrorHelper.json(error, 500, "Failed to confirm payment");
  }
}

function isMissingCheckoutSession(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    (error as { statusCode?: number }).statusCode === 404
  );
}
