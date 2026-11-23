import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";
import { AuthRedirects } from "@/constants/routes";

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignIn fallbackRedirectUrl={AuthRedirects.AFTER_SIGN_IN} />
    </Suspense>
  );
}
