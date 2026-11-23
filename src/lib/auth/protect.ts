import { auth, currentUser } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { ApiKeyHelper } from "@/helpers/api-key";
import { ApiKeyService, UnauthorizedApiKeyError } from "@/services/api-key";

export type AuthContext = {
  clerkId: string;
  email: string;
};

function readApiKey(request: NextRequest): string | null {
  const header = request.headers.get("x-api-key")?.trim();
  if (header) return header;

  const authorization = request.headers.get("authorization");
  if (!authorization) return null;
  const match = /^Bearer\s+(\S+)$/i.exec(authorization);
  return match?.[1] ?? null;
}

export async function requireUser(request: NextRequest): Promise<AuthContext> {
  const session = await auth();
  if (session.userId) {
    return requireAuth();
  }

  const token = readApiKey(request);
  if (!token || !ApiKeyHelper.hasLivePrefix(token)) {
    throw new AuthError("Unauthorized");
  }

  try {
    const user = await ApiKeyService.authenticate(token);
    return { clerkId: user.clerkId, email: user.emailAddress };
  } catch (error) {
    if (error instanceof UnauthorizedApiKeyError) {
      throw new AuthError("Unauthorized");
    }
    throw error;
  }
}

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
