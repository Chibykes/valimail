import type { ReactNode } from "react";
import { Resend } from "resend";
import { EnvKeys, getOptionalEnv } from "@/constants/env";
import { BillingHelper } from "@/helpers/billing";
import { MailFrom, MailSubject } from "@/constants/mail";
import { AppRoutes } from "@/constants/routes";
import PaymentConfirmedEmail from "@/emails/payment-confirmed";
import BulkJobCompletedEmail from "@/emails/bulk-job-completed";
import { prisma } from "@/lib/prisma";

let missingKeyLogged = false;

export class Mailer {
  static async sendPaymentConfirmed(params: {
    userId: string;
    planId: string;
    credits: number;
    priceCents: number;
  }): Promise<void> {
    try {
      const user = await prisma.user.findUnique({ where: { id: params.userId } });
      if (!user?.email) {
        console.error("[mail] payment skipped, user has no email", { userId: params.userId });
        return;
      }

      const planName = params.planId.charAt(0).toUpperCase() + params.planId.slice(1);
      await deliver({
        from: MailFrom.SUPPORT,
        to: user.email,
        subject: MailSubject.PAYMENT_CONFIRMED,
        react: PaymentConfirmedEmail({
          planName,
          amount: BillingHelper.formatPrice(params.priceCents),
          credits: params.credits,
          balance: user.creditBalance,
          billingUrl: absoluteUrl(AppRoutes.DASHBOARD_BILLING),
        }),
      });
    } catch (error) {
      console.error("[mail] payment skipped", {
        userId: params.userId,
        message: error instanceof Error ? error.message : "unknown",
      });
    }
  }

  static async sendBulkJobCompleted(params: {
    userId: string;
    jobId: string;
    listName: string | null;
    total: number;
    safe: number;
    risky: number;
    invalid: number;
    unknown: number;
  }): Promise<void> {
    try {
      const user = await prisma.user.findUnique({ where: { id: params.userId } });
      if (!user?.email) {
        console.error("[mail] list skipped, user has no email", { userId: params.userId });
        return;
      }

      const listName = params.listName?.trim() || "Your list";
      await deliver({
        from: MailFrom.NO_REPLY,
        to: user.email,
        subject: MailSubject.BULK_JOB_COMPLETED,
        react: BulkJobCompletedEmail({
          listName,
          total: params.total,
          safe: params.safe,
          risky: params.risky,
          invalid: params.invalid,
          unknown: params.unknown,
          jobUrl: absoluteUrl(AppRoutes.dashboardJob(params.jobId)),
        }),
      });
    } catch (error) {
      console.error("[mail] list skipped", {
        jobId: params.jobId,
        message: error instanceof Error ? error.message : "unknown",
      });
    }
  }
}

async function deliver(message: {
  from: string;
  to: string;
  subject: string;
  react: ReactNode;
}): Promise<void> {
  const apiKey = getOptionalEnv(EnvKeys.RESEND_API_KEY);
  if (!apiKey) {
    if (!missingKeyLogged) {
      missingKeyLogged = true;
      console.warn("[mail] RESEND_API_KEY is unset; skipping email");
    }
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: message.from,
      to: message.to,
      subject: message.subject,
      react: message.react,
    });
    if (error) {
      console.error("[mail] send failed", { message: error.message });
    }
  } catch (error) {
    console.error("[mail] send failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
  }
}

function absoluteUrl(path: string): string | undefined {
  const base = getOptionalEnv(EnvKeys.APP_URL)?.replace(/\/$/, "");
  if (!base) return undefined;
  return `${base}${path}`;
}
