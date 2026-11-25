import { Prisma } from "@/generated/prisma/client";
import type { BulkJob } from "@/generated/prisma/client";
import { CreditReason } from "@/constants/billing";
import { BulkJobStatus } from "@/constants/validation";
import { InsufficientCreditsError } from "@/helpers/credit-error";
import { prisma } from "@/lib/prisma";

type SpendParams = {
  userId: string;
  cost: number;
  reason: string;
  referenceId?: string | null;
};

type GrantParams = {
  userId: string;
  credits: number;
  planId: string;
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
};

export class CreditRepository {
  static async spend(params: SpendParams) {
    return prisma.$transaction(async (tx) => {
      const user = await CreditRepository.lockUser(tx, params.userId);
      if (user.creditBalance < params.cost) {
        throw new InsufficientCreditsError(user.creditBalance, params.cost);
      }
      const updated = await tx.user.update({
        where: { id: params.userId },
        data: { creditBalance: { decrement: params.cost } },
      });
      await tx.creditLedger.create({
        data: {
          userId: params.userId,
          delta: -params.cost,
          balanceAfter: updated.creditBalance,
          reason: params.reason,
          referenceId: params.referenceId ?? null,
        },
      });
      return updated.creditBalance;
    });
  }

  static async refund(params: {
    userId: string;
    amount: number;
    referenceId?: string | null;
  }) {
    if (params.amount <= 0) return;
    await prisma.$transaction(async (tx) => {
      await CreditRepository.lockUser(tx, params.userId);
      const updated = await tx.user.update({
        where: { id: params.userId },
        data: { creditBalance: { increment: params.amount } },
      });
      await tx.creditLedger.create({
        data: {
          userId: params.userId,
          delta: params.amount,
          balanceAfter: updated.creditBalance,
          reason: CreditReason.REFUND,
          referenceId: params.referenceId ?? null,
        },
      });
    });
  }

  static async acceptBulkJob(params: {
    userId: string;
    name: string | null;
    emails: string[];
  }): Promise<BulkJob> {
    const cost = params.emails.length;
    return prisma.$transaction(async (tx) => {
      const user = await CreditRepository.lockUser(tx, params.userId);
      if (user.creditBalance < cost) {
        throw new InsufficientCreditsError(user.creditBalance, cost);
      }
      const updated = await tx.user.update({
        where: { id: params.userId },
        data: { creditBalance: { decrement: cost } },
      });
      const job = await tx.bulkJob.create({
        data: {
          userId: params.userId,
          name: params.name,
          status: BulkJobStatus.PENDING,
          totalRecords: cost,
          inputEmails: params.emails,
        },
      });
      await tx.creditLedger.create({
        data: {
          userId: params.userId,
          delta: -cost,
          balanceAfter: updated.creditBalance,
          reason: CreditReason.BULK,
          referenceId: job.id,
        },
      });
      return job;
    });
  }

  static async grantPurchase(
    params: GrantParams,
  ): Promise<"granted" | "already_credited"> {
    try {
      return await prisma.$transaction(async (tx) => {
        const existing = await tx.creditLedger.findUnique({
          where: { stripeSessionId: params.stripeSessionId },
        });
        if (existing) return "already_credited";

        await CreditRepository.lockUser(tx, params.userId);
        const updated = await tx.user.update({
          where: { id: params.userId },
          data: { creditBalance: { increment: params.credits } },
        });
        await tx.creditLedger.create({
          data: {
            userId: params.userId,
            delta: params.credits,
            balanceAfter: updated.creditBalance,
            reason: CreditReason.PURCHASE,
            referenceId: params.planId,
            stripeSessionId: params.stripeSessionId,
            stripePaymentIntentId: params.stripePaymentIntentId,
            idempotencyKey: `purchase:${params.stripeSessionId}`,
          },
        });
        return "granted";
      });
    } catch (error) {
      if (!isUniqueConstraint(error)) throw error;
      const existing = await prisma.creditLedger.findUnique({
        where: { stripeSessionId: params.stripeSessionId },
      });
      if (!existing) throw error;
      return "already_credited";
    }
  }

  static async grantNowPayment(params: {
    userId: string;
    credits: number;
    planId: string;
    paymentId: string;
  }): Promise<"granted" | "already_credited"> {
    const idempotencyKey = `purchase:np:${params.paymentId}`;
    try {
      return await prisma.$transaction(async (tx) => {
        const existing = await tx.creditLedger.findUnique({
          where: { nowpaymentsPaymentId: params.paymentId },
        });
        if (existing) return "already_credited";

        await CreditRepository.lockUser(tx, params.userId);
        const updated = await tx.user.update({
          where: { id: params.userId },
          data: { creditBalance: { increment: params.credits } },
        });
        await tx.creditLedger.create({
          data: {
            userId: params.userId,
            delta: params.credits,
            balanceAfter: updated.creditBalance,
            reason: CreditReason.PURCHASE,
            referenceId: params.planId,
            nowpaymentsPaymentId: params.paymentId,
            idempotencyKey,
          },
        });
        return "granted";
      });
    } catch (error) {
      if (!isUniqueConstraint(error)) throw error;
      const existing = await prisma.creditLedger.findUnique({
        where: { nowpaymentsPaymentId: params.paymentId },
      });
      if (!existing) throw error;
      return "already_credited";
    }
  }

  static async reverseNowPayment(paymentId: string) {
    const purchase = await prisma.creditLedger.findUnique({
      where: { nowpaymentsPaymentId: paymentId },
    });
    if (!purchase || purchase.reason !== CreditReason.PURCHASE || purchase.delta <= 0) {
      return false;
    }

    const idempotencyKey = `reversal:np:${paymentId}`;
    try {
      await prisma.$transaction(async (tx) => {
        const existing = await tx.creditLedger.findUnique({
          where: { idempotencyKey },
        });
        if (existing) return;

        const user = await CreditRepository.lockUser(tx, purchase.userId);
        const clawback = Math.min(purchase.delta, Math.max(user.creditBalance, 0));
        const updated = await tx.user.update({
          where: { id: purchase.userId },
          data: { creditBalance: { decrement: clawback } },
        });
        await tx.creditLedger.create({
          data: {
            userId: purchase.userId,
            delta: -clawback,
            balanceAfter: updated.creditBalance,
            reason: CreditReason.REVERSAL,
            referenceId: paymentId,
            idempotencyKey,
          },
        });
      });
    } catch (error) {
      if (!isUniqueConstraint(error)) throw error;
      const existing = await prisma.creditLedger.findUnique({
        where: { idempotencyKey },
      });
      if (!existing) throw error;
    }
    return true;
  }

  static async reversePurchase(paymentIntentId: string) {
    const purchase = await prisma.creditLedger.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
    });
    if (
      !purchase ||
      purchase.reason !== CreditReason.PURCHASE ||
      !purchase.stripeSessionId ||
      purchase.delta <= 0
    ) {
      return false;
    }

    const idempotencyKey = `reversal:${purchase.stripeSessionId}`;
    try {
      await prisma.$transaction(async (tx) => {
        const existing = await tx.creditLedger.findUnique({
          where: { idempotencyKey },
        });
        if (existing) return;

        const user = await CreditRepository.lockUser(tx, purchase.userId);
        const clawback = Math.min(purchase.delta, Math.max(user.creditBalance, 0));
        const updated = await tx.user.update({
          where: { id: purchase.userId },
          data: { creditBalance: { decrement: clawback } },
        });
        await tx.creditLedger.create({
          data: {
            userId: purchase.userId,
            delta: -clawback,
            balanceAfter: updated.creditBalance,
            reason: CreditReason.REVERSAL,
            referenceId: purchase.stripeSessionId,
            idempotencyKey,
          },
        });
      });
    } catch (error) {
      if (!isUniqueConstraint(error)) throw error;
      const existing = await prisma.creditLedger.findUnique({
        where: { idempotencyKey },
      });
      if (!existing) throw error;
    }
    return true;
  }

  static async listForUser(userId: string, take: number) {
    return prisma.creditLedger.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take,
    });
  }

  static async linkStripeCustomer(userId: string, stripeCustomerId: string) {
    await prisma.user.updateMany({
      where: { id: userId, stripeCustomerId: null },
      data: { stripeCustomerId },
    });
  }

  private static async lockUser(
    tx: Prisma.TransactionClient,
    userId: string,
  ) {
    await tx.$executeRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }
}

function isUniqueConstraint(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}
