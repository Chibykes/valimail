import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";
import { AuthRedirects } from "@/constants/routes";

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUp fallbackRedirectUrl={AuthRedirects.AFTER_SIGN_UP} />
    </Suspense>
  );
}
