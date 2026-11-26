import { EnvKeys, getOptionalEnv } from "@/constants/env";
import { ApiRoutes, AppRoutes } from "@/constants/routes";
import { BillingHelper } from "@/helpers/billing";
import { prisma } from "@/lib/prisma";
import { CryptomusClient, type CryptomusPayment } from "@/lib/cryptomus";
import { Mailer } from "@/lib/mail";
import { CreditRepository } from "@/repositories/credit";
import { NowPaymentsBilling } from "@/services/nowpayments-billing";
import { UserService } from "@/services/user";
import type { CheckoutConfirmStatus } from "@/types/api";

type UserParams = {
  clerkId: string;
  emailAddress: string;
};

const PAID_STATUSES = new Set(["paid", "paid_over"]);
const PENDING_STATUSES = new Set(["process", "check", "confirm_check", "refund_process", "locked"]);
const RECONCILE_INTERVAL_MS = 60_000;
const lastReconcileAt = new Map<string, number>();

export class CryptomusOwnershipError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CryptomusOwnershipError";
  }
}

export class CryptomusBilling {
  static async checkout(params: UserParams & { planId: string; origin: string }) {
    const plan = BillingHelper.findPlan(params.planId);
    if (!plan) throw new Error("Unknown plan");

    const user = await UserService.ensureUser(params.clerkId, params.emailAddress);
    const invoice = await prisma.cryptoInvoice.create({
      data: { userId: user.id, planId: plan.id },
    });

    const callback = webhookUrl(params.origin);
    const created = await CryptomusClient.createInvoice({
      amount: (plan.priceCents / 100).toFixed(2),
      currency: "USD",
      order_id: invoice.id,
      ...(callback ? { url_callback: callback } : {}),
      url_success: `${params.origin}${AppRoutes.DASHBOARD_BILLING}?checkout=success&invoice_id=${invoice.id}`,
      url_return: `${params.origin}${AppRoutes.PRICING}`,
      is_payment_multiple: false,
    });

    if (!created.url || !created.uuid) {
      throw new Error("Cryptomus did not return a checkout URL");
    }

    await prisma.cryptoInvoice.update({
      where: { id: invoice.id },
      data: {
        cryptomusUuid: created.uuid,
        status: created.status || created.payment_status || "check",
      },
    });

    console.info("[cryptomus] invoice", {
      userId: user.id,
      planId: plan.id,
      invoiceId: invoice.id,
      uuid: created.uuid,
    });
    return { url: created.url };
  }

  static async handleWebhook(payment: CryptomusPayment): Promise<CheckoutConfirmStatus> {
    return applyPayment(payment);
  }

  static async confirmInvoice(
    params: UserParams & { invoiceId: string },
  ): Promise<{ status: CheckoutConfirmStatus; balance: number }> {
    const user = await UserService.ensureUser(params.clerkId, params.emailAddress);
    const invoice = await prisma.cryptoInvoice.findUnique({
      where: { id: params.invoiceId },
    });
    if (!invoice || invoice.userId !== user.id) {
      throw new CryptomusOwnershipError("This payment belongs to another account");
    }
    if (!invoice.cryptomusUuid && invoice.nowpaymentsInvoiceId) {
      return NowPaymentsBilling.confirmInvoice(params);
    }

    const prior = await CreditRepository.cryptomusGrantState(invoice.id);
    if (prior === "granted") {
      const fresh = await prisma.user.findUnique({ where: { id: user.id } });
      return { status: "already_credited", balance: fresh?.creditBalance ?? user.creditBalance };
    }

    let status: CheckoutConfirmStatus;
    try {
      status = invoice.cryptomusUuid
        ? await applyPayment(await CryptomusClient.paymentInfo(invoice.id))
        : "pending";
    } catch (error) {
      console.error("[cryptomus] confirm lookup failed", {
        invoiceId: invoice.id,
        message: error instanceof Error ? error.message : "unknown",
      });
      status = "pending";
    }

    const fresh = await prisma.user.findUnique({ where: { id: user.id } });
    return { status, balance: fresh?.creditBalance ?? user.creditBalance };
  }

  static async reconcileUser(userId: string) {
    const now = Date.now();
    const last = lastReconcileAt.get(userId) ?? 0;
    if (now - last < RECONCILE_INTERVAL_MS) return;
    lastReconcileAt.set(userId, now);

    const since = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const invoices = await prisma.cryptoInvoice.findMany({
      where: {
        userId,
        cryptomusUuid: { not: null },
        createdAt: { gte: since },
        status: { notIn: ["paid", "paid_over", "refund_paid"] },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    for (const invoice of invoices) {
      try {
        await applyPayment(await CryptomusClient.paymentInfo(invoice.id));
      } catch (error) {
        console.error("[cryptomus] reconcile failed", {
          invoiceId: invoice.id,
          message: error instanceof Error ? error.message : "unknown",
        });
      }
    }
  }
}

function webhookUrl(origin: string): string | undefined {
  const configured = getOptionalEnv(EnvKeys.CRYPTOMUS_WEBHOOK_URL);
  const candidate = configured ?? `${origin}${ApiRoutes.CRYPTOMUS_WEBHOOK}`;
  if (isPublicHttpUrl(candidate)) return candidate;
  console.warn("[cryptomus] omitted url_callback because Cryptomus rejects private hosts");
  return undefined;
}

function isPublicHttpUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host === "host.docker.internal" ||
    host === "::1" ||
    host === "0.0.0.0"
  ) {
    return false;
  }
  const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!match) return true;
  const a = Number(match[1]);
  const b = Number(match[2]);
  if (a === 10 || a === 127 || a === 0) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && b === 168) return false;
  return true;
}

async function applyPayment(payment: CryptomusPayment): Promise<CheckoutConfirmStatus> {
  const orderId = payment.order_id ? String(payment.order_id) : "";
  const uuid = payment.uuid ? String(payment.uuid) : "";
  const invoice = orderId
    ? await prisma.cryptoInvoice.findUnique({ where: { id: orderId } })
    : uuid
      ? await prisma.cryptoInvoice.findUnique({ where: { cryptomusUuid: uuid } })
      : null;
  if (!invoice) {
    console.error("[cryptomus] unknown order", { orderId, uuid });
    return "ignored";
  }

  const status = payment.status || payment.payment_status || invoice.status;
  if (shouldStoreStatus(invoice.status, status)) {
    await prisma.cryptoInvoice.update({
      where: { id: invoice.id },
      data: {
        status,
        ...(uuid ? { cryptomusUuid: invoice.cryptomusUuid ?? uuid } : {}),
      },
    });
  }

  if (status === "refund_paid" || invoice.status === "refund_paid") {
    await CreditRepository.reverseCryptomus(invoice.id);
    return "ignored";
  }

  if (!PAID_STATUSES.has(status)) {
    return PENDING_STATUSES.has(status) ? "pending" : "ignored";
  }

  const plan = BillingHelper.findPlan(invoice.planId);
  if (!plan || !priceAccepted(payment, plan.priceCents)) {
    console.error("[cryptomus] ignored payment", {
      invoiceId: invoice.id,
      status,
      currency: payment.currency ?? null,
    });
    return "ignored";
  }

  const result = await CreditRepository.grantCryptomus({
    userId: invoice.userId,
    credits: plan.credits,
    planId: plan.id,
    invoiceId: invoice.id,
    paymentId: uuid || invoice.cryptomusUuid || invoice.id,
  });
  if (result === "granted") {
    console.info("[cryptomus] granted", {
      userId: invoice.userId,
      credits: plan.credits,
      invoiceId: invoice.id,
    });
    await Mailer.sendPaymentConfirmed({
      userId: invoice.userId,
      planId: plan.id,
      credits: plan.credits,
      priceCents: plan.priceCents,
    });
  }
  return result;
}

function shouldStoreStatus(current: string, next: string): boolean {
  if (!next) return false;
  if (PAID_STATUSES.has(current) && !PAID_STATUSES.has(next) && next !== "refund_paid") {
    return false;
  }
  if (current === "refund_paid" && next !== "refund_paid") return false;
  return true;
}

function priceAccepted(payment: CryptomusPayment, priceCents: number): boolean {
  const currency = payment.currency?.toUpperCase() ?? "";
  if (currency && currency !== "USD") return true;
  const cents = usdCents(payment.amount);
  return cents === null || cents === priceCents;
}

function usdCents(value: CryptomusPayment["amount"]): number | null {
  if (value === null || value === undefined || value === "") return null;
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) return null;
  return Math.round(amount * 100);
}
