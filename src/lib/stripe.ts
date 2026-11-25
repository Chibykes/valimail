import Stripe from "stripe";
import { EnvKeys, getEnv } from "@/constants/env";

const globalForStripe = globalThis as unknown as {
  stripe: Stripe | undefined;
};

export function getStripe(): Stripe {
  if (!globalForStripe.stripe) {
    globalForStripe.stripe = new Stripe(getEnv(EnvKeys.STRIPE_SECRET_KEY));
  }
  return globalForStripe.stripe;
}
