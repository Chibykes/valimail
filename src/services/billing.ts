import type { NextRequest } from "next/server";
import type Stripe from "stripe";
import { LEDGER_PAGE_SIZE } from "@/constants/billing";
import { AppRoutes } from "@/constants/routes";
import { BillingHelper } from "@/helpers/billing";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { CreditRepository } from "@/repositories/credit";
import { CryptomusBilling } from "@/services/cryptomus-billing";
import { NowPaymentsBilling } from "@/services/nowpayments-billing";
import { UserService } from "@/services/user";
import type { BillingAccountResponse } from "@/types/api";

type UserParams = {
  clerkId: string;
  emailAddress: string;
};

export class BillingService {
  static origin(request: NextRequest): string {
    const host =
      request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    const proto =
      request.headers.get("x-forwarded-proto") ??
      request.nextUrl.protocol.replace(":", "");
    if (host) return `${proto}://${host}`;
    return request.nextUrl.origin;
  }

  static async account(params: UserParams): Promise<BillingAccountResponse> {
    const user = await UserService.ensureUser(
      params.clerkId,
      params.emailAddress,
    );
    await BillingService.reconcilePaidSessions(user);
    await CryptomusBilling.reconcileUser(user.id).catch((error) => {
      console.error("[cryptomus] reconcile failed", {
        userId: user.id,
        message: error instanceof Error ? error.message : "unknown",
      });
    });
    await NowPaymentsBilling.reconcileUser(user.id).catch((error) => {
      console.error("[nowpayments] reconcile failed", {
        userId: user.id,
        message: error instanceof Error ? error.message : "unknown",
      });
    });
    const fresh = await prisma.user.findUnique({ where: { id: user.id } });
    const entries = await CreditRepository.listForUser(user.id, LEDGER_PAGE_SIZE);
    return {
      balance: fresh?.creditBalance ?? user.creditBalance,
      entries: entries.map((entry) => ({
        id: entry.id,
        delta: entry.delta,
        balanceAfter: entry.balanceAfter,
        reason: entry.reason,
        createdAt: entry.createdAt.toISOString(),
      })),
    };
  }

  static async checkout(params: UserParams & { planId: string; origin: string }) {
    const plan = BillingHelper.findPlan(params.planId);
    if (!plan) {
      throw new Error("Unknown plan");
    }

    const user = await UserService.ensureUser(
      params.clerkId,
      params.emailAddress,
    );
    const customerId = await BillingService.ensureCustomer(user);
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        planId: plan.id,
        credits: String(plan.credits),
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: plan.priceCents,
            product_data: {
              name: `${plan.credits.toLocaleString("en-US")} Valimail credits`,
              description:
                plan.discountPercent > 0
                  ? `${plan.discountPercent}% off the $5 per 1,000 base rate`
                  : `${plan.credits.toLocaleString("en-US")} credits`,
            },
          },
        },
      ],
      success_url: `${params.origin}${AppRoutes.DASHBOARD_BILLING}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${params.origin}${AppRoutes.PRICING}`,
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL");
    }

    console.info("[billing] checkout", { userId: user.id, planId: plan.id });
    return { url: session.url };
  }

  static async confirmCheckout(
    params: UserParams & { sessionId: string },
  ): Promise<{ status: CheckoutGrantStatus; balance: number }> {
    if (!params.sessionId.startsWith("cs_")) {
      throw new Error("Invalid checkout session");
    }

    const user = await UserService.ensureUser(
      params.clerkId,
      params.emailAddress,
    );
    const session = await getStripe().checkout.sessions.retrieve(params.sessionId);
    const ownerId = session.metadata?.userId || session.client_reference_id;
    if (ownerId !== user.id) {
      throw new CheckoutOwnershipError("This payment belongs to another account");
    }

    const status = await BillingService.grantFromSession(session);
    const fresh = await prisma.user.findUnique({ where: { id: user.id } });
    return { status, balance: fresh?.creditBalance ?? user.creditBalance };
  }

  static async handleEvent(event: Stripe.Event) {
    if (event.type === "checkout.session.completed") {
      await BillingService.grantFromSession(event.data.object);
      return;
    }
    if (event.type === "charge.refunded") {
      await BillingService.reverseCharge(event.data.object);
    }
  }

  private static async ensureCustomer(user: {
    id: string;
    clerkId: string;
    email: string;
    stripeCustomerId: string | null;
  }) {
    if (user.stripeCustomerId) return user.stripeCustomerId;

    const customer = await getStripe().customers.create({
      email: user.email,
      metadata: { userId: user.id, clerkId: user.clerkId },
    });
    await CreditRepository.linkStripeCustomer(user.id, customer.id);
    const fresh = await prisma.user.findUnique({ where: { id: user.id } });
    return fresh?.stripeCustomerId ?? customer.id;
  }

  private static async reconcilePaidSessions(user: {
    id: string;
    stripeCustomerId: string | null;
  }) {
    if (!user.stripeCustomerId) return;

    const now = Date.now();
    const last = lastReconcileAt.get(user.id) ?? 0;
    if (now - last < RECONCILE_INTERVAL_MS) return;
    lastReconcileAt.set(user.id, now);

    try {
      const listed = await getStripe().checkout.sessions.list({
        customer: user.stripeCustomerId,
        limit: 10,
        status: "complete",
      });
      for (const session of listed.data) {
        if (session.metadata?.userId && session.metadata.userId !== user.id) continue;
        await BillingService.grantFromSession(session);
      }
    } catch (error) {
      console.error("[billing] reconcile failed", {
        userId: user.id,
        message: error instanceof Error ? error.message : "unknown",
      });
    }
  }

  private static async grantFromSession(
    session: Stripe.Checkout.Session,
  ): Promise<CheckoutGrantStatus> {
    if (session.payment_status !== "paid") return "unpaid";

    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;
    const credits = Number(session.metadata?.credits);
    const plan = planId ? BillingHelper.findPlan(planId) : undefined;
    if (!userId || !plan || plan.credits !== credits) {
      console.error("[billing] ignored checkout session", { sessionId: session.id });
      return "ignored";
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      console.error("[billing] checkout user missing", { sessionId: session.id });
      return "ignored";
    }

    const customerId = stripeId(session.customer);
    if (customerId) {
      await CreditRepository.linkStripeCustomer(user.id, customerId).catch((error) => {
        console.error("[billing] customer link failed", {
          message: error instanceof Error ? error.message : "unknown",
        });
      });
    }

    const result = await CreditRepository.grantPurchase({
      userId: user.id,
      credits: plan.credits,
      planId: plan.id,
      stripeSessionId: session.id,
      stripePaymentIntentId: stripeId(session.payment_intent),
    });
    if (result === "granted") {
      console.info("[billing] granted", {
        userId: user.id,
        credits: plan.credits,
        sessionId: session.id,
      });
    }
    return result;
  }

  private static async reverseCharge(charge: Stripe.Charge) {
    const paymentIntentId = stripeId(charge.payment_intent);
    if (!paymentIntentId) return;
    const reversed = await CreditRepository.reversePurchase(paymentIntentId);
    if (!reversed) {
      console.info("[billing] refund without purchase", { paymentIntentId });
    }
  }
}

const RECONCILE_INTERVAL_MS = 60_000;
const lastReconcileAt = new Map<string, number>();

export type CheckoutGrantStatus =
  | "granted"
  | "already_credited"
  | "unpaid"
  | "pending"
  | "ignored";

export class CheckoutOwnershipError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CheckoutOwnershipError";
  }
}

function stripeId(
  value: string | { id: string } | null | undefined,
): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}
