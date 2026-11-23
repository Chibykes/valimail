import { NextRequest, NextResponse } from "next/server";
import { ApiErrorHelper } from "@/helpers/api-error";
import { AuthError, requireAuth } from "@/lib/auth/protect";
import { BulkJobService } from "@/services/bulk-job";

export async function POST(request: NextRequest) {
  try {
    const authContext = await requireAuth();
    const body = (await request.json()) as {
      input?: string[];
      emails?: string[];
    };

    const emails = body.input ?? body.emails ?? [];
    if (!Array.isArray(emails) || emails.length === 0) {
      return ApiErrorHelper.badRequest("input array of emails is required");
    }

    const result = await BulkJobService.create({
      clerkId: authContext.clerkId,
      emailAddress: authContext.email,
      emails,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return ApiErrorHelper.unauthorized(error.message);
    }
    return ApiErrorHelper.json(error, 502, "Bulk job creation failed");
  }
}
