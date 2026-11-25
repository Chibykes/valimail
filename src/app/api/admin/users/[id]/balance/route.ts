import { NextRequest, NextResponse } from "next/server";
import { ApiErrorHelper } from "@/helpers/api-error";
import { AdminAuthError, assertAdminRequest } from "@/lib/admin-guard";
import { AdminBalanceError, AdminRepository } from "@/repositories/admin";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await assertAdminRequest(request);
    const { id } = await context.params;
    const body = (await request.json()) as { delta?: unknown; note?: unknown };
    const delta = typeof body.delta === "number" ? body.delta : Number(body.delta);
    const note = typeof body.note === "string" ? body.note : "";
    const balance = await AdminRepository.adjustBalance({ userId: id, delta, note });
    return NextResponse.json({ balance });
  } catch (error) {
    if (error instanceof AdminAuthError) return ApiErrorHelper.unauthorized();
    if (error instanceof AdminBalanceError) return ApiErrorHelper.badRequest(error.message);
    return ApiErrorHelper.json(error, 500, "Failed to update balance");
  }
}
