import { NextRequest, NextResponse } from "next/server";
import { ApiErrorHelper } from "@/helpers/api-error";
import { InsufficientCreditsError } from "@/helpers/credit-error";
import { AuthError, requireAuth, requireUser } from "@/lib/auth/protect";
import { BulkJobService } from "@/services/bulk-job";
import type { CreateBulkRequest } from "@/types/api";

export async function GET() {
  try {
    const authContext = await requireAuth();
    const result = await BulkJobService.list({
      clerkId: authContext.clerkId,
      emailAddress: authContext.email,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return ApiErrorHelper.unauthorized(error.message);
    }
    return ApiErrorHelper.json(error, 500, "Failed to load lists");
  }
}

export async function POST(request: NextRequest) {
  try {
    const authContext = await requireUser(request);
    const body = (await request.json()) as CreateBulkRequest;

    const emails = body.input ?? body.emails ?? [];
    if (!Array.isArray(emails) || emails.length === 0) {
      return ApiErrorHelper.badRequest("input array of emails is required");
    }

    const result = await BulkJobService.create({
      clerkId: authContext.clerkId,
      emailAddress: authContext.email,
      emails,
      name: typeof body.name === "string" ? body.name : undefined,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return ApiErrorHelper.unauthorized(error.message);
    }
    if (error instanceof InsufficientCreditsError) {
      return ApiErrorHelper.insufficientCredits(error);
    }
    console.error("[bulk] create failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return ApiErrorHelper.json(error, 502, "Bulk job creation failed");
  }
}
