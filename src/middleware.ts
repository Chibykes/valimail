import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/constants/admin";
import { AppRoutes, AuthRedirects } from "@/constants/routes";
import { verifyAdminSession } from "@/lib/admin-session";

const isPublicRoute = createRouteMatcher([
  "/",
  "/docs(.*)",
  "/pricing(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/v1/health(.*)",
  "/api/v1/stripe/webhook(.*)",
  "/api/v1/nowpayments/webhook(.*)",
  "/api/v1/cryptomus/webhook(.*)",
]);

const isApiKeyRoute = createRouteMatcher([
  "/api/v1/check-email",
  "/api/v1/check-email/(.*)",
  "/api/v1/bulk",
  "/api/v1/bulk/(.*)",
]);

const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);
const isAdminLogin = createRouteMatcher([
  "/admin/login",
  "/api/admin/login",
  "/api/admin/logout",
]);

async function hasAdminSession(request: NextRequest) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const value = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!secret || !value) return false;
  return verifyAdminSession(value, secret);
}

export default clerkMiddleware(async (auth, request) => {
  if (isAdminRoute(request)) {
    const signedIn = await hasAdminSession(request);
    if (request.nextUrl.pathname === AppRoutes.ADMIN_LOGIN && signedIn) {
      return NextResponse.redirect(new URL(AppRoutes.ADMIN, request.url));
    }
    if (!isAdminLogin(request) && !signedIn) {
      if (request.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL(AppRoutes.ADMIN_LOGIN, request.url));
    }
    return NextResponse.next();
  }

  if (isAuthRoute(request)) {
    const { userId } = await auth();
    if (userId) {
      const requested = request.nextUrl.searchParams.get("redirect_url");
      const target =
        requested?.startsWith("/") && !requested.startsWith("//")
          ? requested
          : AuthRedirects.AFTER_SIGN_IN;
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  if (!isPublicRoute(request) && !isApiKeyRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
