import { CREDIT_PLANS, type CreditPlan } from "@/constants/billing";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export class BillingHelper {
  static findPlan(id: string): CreditPlan | undefined {
    return CREDIT_PLANS.find((plan) => plan.id === id);
  }

  static formatPrice(cents: number): string {
    return usd.format(cents / 100);
  }

  static pricePerThousand(plan: CreditPlan): string {
    const perThousandCents = plan.priceCents / (plan.credits / 1_000);
    return usd.format(perThousandCents / 100);
  }
}
