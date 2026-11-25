import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { AuthRedirects } from "@/constants/routes";

const isPublicRoute = createRouteMatcher([
  "/",
  "/docs(.*)",
  "/pricing(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/v1/health(.*)",
  "/api/v1/stripe/webhook(.*)",
]);

const isApiKeyRoute = createRouteMatcher([
  "/api/v1/check-email",
  "/api/v1/check-email/(.*)",
  "/api/v1/bulk",
  "/api/v1/bulk/(.*)",
]);

const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request) => {
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
