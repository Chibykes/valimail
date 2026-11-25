import { NextRequest, NextResponse } from "next/server";
import { EnvKeys, getEnv } from "@/constants/env";
import { AppRoutes } from "@/constants/routes";
import { ApiErrorHelper } from "@/helpers/api-error";
import { verifyAdminPassword } from "@/lib/admin-password";
import { adminCookieOptions, signAdminSession } from "@/lib/admin-session";

const failures = new Map<string, number>();

export async function POST(request: NextRequest) {
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  try {
    const body = (await request.json()) as { password?: unknown };
    const password = typeof body.password === "string" ? body.password : "";
    const hash = getEnv(EnvKeys.ADMIN_PASSWORD_HASH);
    const secret = getEnv(EnvKeys.ADMIN_SESSION_SECRET);
    const matches = password.length > 0 && (await verifyAdminPassword(password, hash));
    if (!matches) {
      const count = (failures.get(key) ?? 0) + 1;
      failures.set(key, count);
      await delay(Math.min(400 + count * 200, 2_400));
      return ApiErrorHelper.unauthorized("Wrong password");
    }

    failures.delete(key);
    const response = NextResponse.json({ ok: true, redirect: AppRoutes.ADMIN });
    const options = adminCookieOptions();
    response.cookies.set({
      ...options,
      value: await signAdminSession(secret),
    });
    return response;
  } catch (error) {
    await delay(400);
    return ApiErrorHelper.json(error, 500, "Admin login is not configured");
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
