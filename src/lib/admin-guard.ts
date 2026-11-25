import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { ADMIN_COOKIE } from "@/constants/admin";
import { AppRoutes } from "@/constants/routes";
import { verifyAdminSession } from "@/lib/admin-session";

export class AdminAuthError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "AdminAuthError";
  }
}

export async function assertAdminRequest(request: NextRequest) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!secret || !token || !(await verifyAdminSession(token, secret))) {
    throw new AdminAuthError();
  }
}

export async function requireAdminPage() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!secret || !token || !(await verifyAdminSession(token, secret))) {
    redirect(AppRoutes.ADMIN_LOGIN);
  }
}
