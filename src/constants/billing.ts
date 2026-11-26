export const CreditReason = {
  SINGLE: "single",
  BULK: "bulk",
  PURCHASE: "purchase",
  REFUND: "refund",
  REVERSAL: "reversal",
  ADMIN: "admin",
} as const;

export type CreditReason = (typeof CreditReason)[keyof typeof CreditReason];

export const LEDGER_PAGE_SIZE = 20;

export const CREDIT_PLANS = [
  { id: "test", credits: 200, priceCents: 100, discountPercent: 0 },
  { id: "starter", credits: 1_000, priceCents: 500, discountPercent: 0 },
  { id: "growth", credits: 5_000, priceCents: 2_000, discountPercent: 20 },
  { id: "scale", credits: 25_000, priceCents: 7_500, discountPercent: 40 },
  { id: "business", credits: 100_000, priceCents: 20_000, discountPercent: 60 },
] as const;

export type CreditPlan = (typeof CREDIT_PLANS)[number];
export type CreditPlanId = CreditPlan["id"];

export const CREDIT_REASON_LABELS: Record<CreditReason, string> = {
  [CreditReason.SINGLE]: "Single check",
  [CreditReason.BULK]: "List validation",
  [CreditReason.PURCHASE]: "Credit purchase",
  [CreditReason.REFUND]: "Check refund",
  [CreditReason.REVERSAL]: "Payment reversal",
  [CreditReason.ADMIN]: "Admin adjustment",
};
