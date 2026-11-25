import { NextRequest, NextResponse } from "next/server";
import { AppRoutes } from "@/constants/routes";
import { adminCookieOptions } from "@/lib/admin-session";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL(AppRoutes.ADMIN_LOGIN, request.url), 303);
  response.cookies.set({
    ...adminCookieOptions(0),
    value: "",
  });
  return response;
}
