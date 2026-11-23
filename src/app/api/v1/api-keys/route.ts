import { NextRequest, NextResponse } from "next/server";
import { ApiErrorHelper } from "@/helpers/api-error";
import { AuthError, requireAuth } from "@/lib/auth/protect";
import {
  ApiKeyLimitError,
  ApiKeyService,
} from "@/services/api-key";

export async function GET() {
  try {
    const authContext = await requireAuth();
    const result = await ApiKeyService.list({
      clerkId: authContext.clerkId,
      emailAddress: authContext.email,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return ApiErrorHelper.unauthorized(error.message);
    }
    return ApiErrorHelper.json(error, 500, "Failed to load API keys");
  }
}

export async function POST(request: NextRequest) {
  try {
    const authContext = await requireAuth();
    const body = (await request.json()) as { name?: string };
    const result = await ApiKeyService.create({
      clerkId: authContext.clerkId,
      emailAddress: authContext.email,
      name: typeof body.name === "string" ? body.name : "",
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return ApiErrorHelper.unauthorized(error.message);
    }
    if (error instanceof ApiKeyLimitError) {
      return ApiErrorHelper.badRequest(error.message);
    }
    if (error instanceof Error && /name/i.test(error.message)) {
      return ApiErrorHelper.badRequest(error.message);
    }
    return ApiErrorHelper.json(error, 500, "Failed to create API key");
  }
}
