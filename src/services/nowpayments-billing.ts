import { AppRoutes } from "@/constants/routes";
import { BillingHelper } from "@/helpers/billing";
import { prisma } from "@/lib/prisma";
import { NowPaymentsClient, type NowPayment } from "@/lib/nowpayments";
import { Mailer } from "@/lib/mail";
import { CreditRepository } from "@/repositories/credit";
import { UserService } from "@/services/user";
import type { CheckoutConfirmStatus } from "@/types/api";

type UserParams = {
  clerkId: string;
  emailAddress: string;
};

export class NowPaymentsOwnershipError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NowPaymentsOwnershipError";
  }
}

export class NowPaymentsBilling {
  static async checkout(params: UserParams & { planId: string; origin: string }) {
    const plan = BillingHelper.findPlan(params.planId);
    if (!plan) throw new Error("Unknown plan");

    const user = await UserService.ensureUser(params.clerkId, params.emailAddress);
    const invoice = await prisma.cryptoInvoice.create({
      data: { userId: user.id, planId: plan.id },
    });

    const created = await NowPaymentsClient.createInvoice({
      price_amount: plan.priceCents / 100,
      price_currency: "usd",
      order_id: invoice.id,
      order_description: `${plan.credits.toLocaleString("en-US")} Valimail credits`,
      ipn_callback_url: `${params.origin}/api/v1/nowpayments/webhook`,
      success_url: `${params.origin}${AppRoutes.DASHBOARD_BILLING}?checkout=success&invoice_id=${invoice.id}`,
      cancel_url: `${params.origin}${AppRoutes.PRICING}`,
      is_fixed_rate: true,
      is_fee_paid_by_user: false,
    });

    await prisma.cryptoInvoice.update({
      where: { id: invoice.id },
      data: { nowpaymentsInvoiceId: String(created.id) },
    });

    if (!created.invoice_url) {
      throw new Error("NOWPayments did not return a checkout URL");
    }
    console.info("[nowpayments] invoice", { userId: user.id, planId: plan.id });
    return { url: created.invoice_url };
  }

  static async handleIpn(payment: NowPayment): Promise<CheckoutConfirmStatus> {
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
      throw new NowPaymentsOwnershipError("This payment belongs to another account");
    }

    let status: CheckoutConfirmStatus;
    try {
      status = await recoverInvoice(invoice);
    } catch (error) {
      console.error("[nowpayments] confirm lookup failed", {
        invoiceId: invoice.id,
        message: error instanceof Error ? error.message : "unknown",
      });
      status = invoice.status === "finished" ? "already_credited" : "pending";
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
        nowpaymentsInvoiceId: { not: null },
        createdAt: { gte: since },
        status: { notIn: ["finished", "refunded"] },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    for (const invoice of invoices) {
      try {
        await recoverInvoice(invoice);
      } catch (error) {
        console.error("[nowpayments] reconcile failed", {
          invoiceId: invoice.id,
          message: error instanceof Error ? error.message : "unknown",
        });
      }
    }
  }
}

const RECONCILE_INTERVAL_MS = 60_000;
const lastReconcileAt = new Map<string, number>();

async function recoverInvoice(invoice: {
  id: string;
  nowpaymentsInvoiceId: string | null;
  status: string;
}): Promise<CheckoutConfirmStatus> {
  if (!invoice.nowpaymentsInvoiceId) return "pending";
  const payments = await NowPaymentsClient.listInvoicePayments(invoice.nowpaymentsInvoiceId);
  if (payments.length === 0) return invoice.status === "finished" ? "already_credited" : "pending";

  let latest: CheckoutConfirmStatus = "pending";
  for (const payment of payments) {
    const next = await applyPayment(payment);
    if (next === "granted" || next === "already_credited") latest = next;
    else if (latest !== "granted" && latest !== "already_credited") latest = next;
  }
  return latest;
}

async function applyPayment(payment: NowPayment): Promise<CheckoutConfirmStatus> {
  const orderId = payment.order_id ? String(payment.order_id) : "";
  const remoteInvoiceId =
    payment.invoice_id === null || payment.invoice_id === undefined
      ? ""
      : String(payment.invoice_id);
  const invoice = orderId
    ? await prisma.cryptoInvoice.findUnique({ where: { id: orderId } })
    : remoteInvoiceId
      ? await prisma.cryptoInvoice.findUnique({
          where: { nowpaymentsInvoiceId: remoteInvoiceId },
        })
      : null;
  if (!invoice) {
    console.error("[nowpayments] unknown order", { orderId, remoteInvoiceId });
    return "ignored";
  }

  const paymentId =
    payment.payment_id === undefined || payment.payment_id === null
      ? ""
      : String(payment.payment_id);
  const status = payment.payment_status ?? invoice.status;
  const repeat = isRepeat(payment.parent_payment_id);
  if (!repeat) {
    await prisma.cryptoInvoice.update({
      where: { id: invoice.id },
      data: {
        status,
        ...(paymentId ? { paymentId: invoice.paymentId ?? paymentId } : {}),
      },
    });
  }

  if (status === "refunded" && paymentId) {
    await CreditRepository.reverseNowPayment(paymentId);
    return "ignored";
  }

  if (status !== "finished" || !paymentId) return "pending";
  if (isRepeat(payment.parent_payment_id)) {
    console.info("[nowpayments] ignored repeat deposit", { paymentId });
    return "ignored";
  }

  const plan = BillingHelper.findPlan(invoice.planId);
  const priceCents = Math.round(Number(payment.price_amount) * 100);
  if (
    !plan ||
    payment.price_currency?.toLowerCase() !== "usd" ||
    !Number.isFinite(priceCents) ||
    priceCents !== plan.priceCents
  ) {
    console.error("[nowpayments] ignored payment", { paymentId, orderId: invoice.id });
    return "ignored";
  }

  const result = await CreditRepository.grantNowPayment({
    userId: invoice.userId,
    credits: plan.credits,
    planId: plan.id,
    paymentId,
  });
  if (result === "granted") {
    console.info("[nowpayments] granted", {
      userId: invoice.userId,
      credits: plan.credits,
      paymentId,
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

function isRepeat(parentPaymentId: NowPayment["parent_payment_id"]): boolean {
  return (
    parentPaymentId !== null &&
    parentPaymentId !== undefined &&
    parentPaymentId !== "" &&
    parentPaymentId !== 0
  );
}
