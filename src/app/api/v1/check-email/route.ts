import { NextRequest, NextResponse } from "next/server";
import { ApiErrorHelper } from "@/helpers/api-error";
import { InsufficientCreditsError } from "@/helpers/credit-error";
import { AuthError, requireAuth, requireUser } from "@/lib/auth/protect";
import { ValidationService } from "@/services/validation";

export async function GET() {
  try {
    const authContext = await requireAuth();
    const result = await ValidationService.listRecent({
      clerkId: authContext.clerkId,
      emailAddress: authContext.email,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return ApiErrorHelper.unauthorized(error.message);
    }
    return ApiErrorHelper.json(error, 500, "Failed to load recent checks");
  }
}

export async function POST(request: NextRequest) {
  try {
    const authContext = await requireUser(request);
    const body = (await request.json()) as {
      email?: string;
      to_email?: string;
    };
    const email = (body.to_email ?? body.email)?.trim();

    if (!email) {
      return ApiErrorHelper.badRequest("to_email is required");
    }

    const sync = request.nextUrl.searchParams.get("sync") === "1";
    console.info("[check-email] start", { sync, hasToEmail: Boolean(email) });
    const result = await ValidationService.checkEmail({
      clerkId: authContext.clerkId,
      emailAddress: authContext.email,
      toEmail: email,
      sync,
    });

    console.info("[check-email] done", {
      isReachable: result.isReachable,
      source: result.source,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return ApiErrorHelper.unauthorized(error.message);
    }
    if (error instanceof InsufficientCreditsError) {
      return ApiErrorHelper.insufficientCredits(error);
    }
    console.error("[check-email] failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return ApiErrorHelper.json(error, 502, "Email validation failed");
  }
}
