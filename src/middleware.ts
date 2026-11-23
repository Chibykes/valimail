import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { AuthRedirects } from "@/constants/routes";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
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

  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
