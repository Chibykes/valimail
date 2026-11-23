import { auth, currentUser } from "@clerk/nextjs/server";

export type AuthContext = {
  clerkId: string;
  email: string;
};

export async function requireAuth(): Promise<AuthContext> {
  const session = await auth();
  if (!session.userId) {
    throw new AuthError("Unauthorized");
  }

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    "";

  if (!email) {
    throw new AuthError("Authenticated user has no email");
  }

  return {
    clerkId: session.userId,
    email,
  };
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}
