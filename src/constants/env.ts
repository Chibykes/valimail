export const EnvKeys = {
  DATABASE_URL: "DATABASE_URL",
  REACHER_BASE_URL: "REACHER_BASE_URL",
  REACHER_HEADER_SECRET: "REACHER_HEADER_SECRET",
  CLERK_SECRET_KEY: "CLERK_SECRET_KEY",
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: "NEXT_PUBLIC_CLERK_SIGN_UP_URL",
  STRIPE_SECRET_KEY: "STRIPE_SECRET_KEY",
  STRIPE_WEBHOOK_SECRET: "STRIPE_WEBHOOK_SECRET",
  ADMIN_PASSWORD_HASH: "ADMIN_PASSWORD_HASH",
  ADMIN_SESSION_SECRET: "ADMIN_SESSION_SECRET",
  NOWPAYMENTS_API_KEY: "NOWPAYMENTS_API_KEY",
  NOWPAYMENTS_IPN_SECRET: "NOWPAYMENTS_IPN_SECRET",
  NOWPAYMENTS_EMAIL: "NOWPAYMENTS_EMAIL",
  NOWPAYMENTS_PASSWORD: "NOWPAYMENTS_PASSWORD",
  NOWPAYMENTS_API_BASE: "NOWPAYMENTS_API_BASE",
} as const;

export function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getOptionalEnv(key: string): string | undefined {
  const value = process.env[key];
  if (value === undefined || value === "") return undefined;
  return value;
}

export function getReacherBaseUrl(): string {
  return getEnv(EnvKeys.REACHER_BASE_URL, "http://localhost:8080");
}

export function getReacherHeaderSecret(): string | undefined {
  return getOptionalEnv(EnvKeys.REACHER_HEADER_SECRET);
}
