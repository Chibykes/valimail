import { NextRequest, NextResponse } from "next/server";
import { ApiErrorHelper } from "@/helpers/api-error";
import { AdminAuthError, assertAdminRequest } from "@/lib/admin-guard";
import { AdminJobError, AdminRepository } from "@/repositories/admin";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await assertAdminRequest(request);
    const { id } = await context.params;
    const result = await AdminRepository.cancelPending(id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AdminAuthError) return ApiErrorHelper.unauthorized();
    if (error instanceof AdminJobError) return ApiErrorHelper.badRequest(error.message);
    return ApiErrorHelper.json(error, 500, "Failed to cancel list");
  }
}
