import { NextRequest, NextResponse } from "next/server";
import { ApiErrorHelper } from "@/helpers/api-error";
import { AuthError, requireAuth } from "@/lib/auth/protect";
import { ValidationService } from "@/services/validation";

export async function POST(request: NextRequest) {
  try {
    const authContext = await requireAuth();
    const body = (await request.json()) as {
      email?: string;
      to_email?: string;
    };
    const email = (body.to_email ?? body.email)?.trim();

    if (!email) {
      return ApiErrorHelper.badRequest("to_email is required");
    }

    const sync = request.nextUrl.searchParams.get("sync") === "1";
    const result = await ValidationService.checkEmail({
      clerkId: authContext.clerkId,
      emailAddress: authContext.email,
      toEmail: email,
      sync,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return ApiErrorHelper.unauthorized(error.message);
    }
    return ApiErrorHelper.json(error, 502, "Email validation failed");
  }
}
