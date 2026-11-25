import { NextResponse } from "next/server";
import { ApiErrorHelper } from "@/helpers/api-error";
import { AuthError, requireAuth } from "@/lib/auth/protect";
import { BillingService } from "@/services/billing";

export async function GET() {
  try {
    const authContext = await requireAuth();
    const result = await BillingService.account({
      clerkId: authContext.clerkId,
      emailAddress: authContext.email,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return ApiErrorHelper.unauthorized(error.message);
    }
    return ApiErrorHelper.json(error, 500, "Failed to load billing");
  }
}
