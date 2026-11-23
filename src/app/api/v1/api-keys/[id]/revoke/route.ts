import { NextRequest, NextResponse } from "next/server";
import { ApiErrorHelper } from "@/helpers/api-error";
import { AuthError, requireAuth } from "@/lib/auth/protect";
import { ApiKeyNotFoundError, ApiKeyService } from "@/services/api-key";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    const authContext = await requireAuth();
    const { id } = await context.params;
    const result = await ApiKeyService.revoke({
      clerkId: authContext.clerkId,
      emailAddress: authContext.email,
      id,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return ApiErrorHelper.unauthorized(error.message);
    }
    if (error instanceof ApiKeyNotFoundError) {
      return ApiErrorHelper.notFound(error.message);
    }
    return ApiErrorHelper.json(error, 500, "Failed to revoke API key");
  }
}
