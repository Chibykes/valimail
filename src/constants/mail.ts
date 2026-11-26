import { Brand } from "@/constants/brand";

export const MailAddress = {
  SUPPORT: "support@valimail.dscrdbots.cc",
  NO_REPLY: "no-reply@valimail.dscrdbots.cc",
} as const;

export const MailFrom = {
  SUPPORT: `${Brand.NAME} <${MailAddress.SUPPORT}>`,
  NO_REPLY: `${Brand.NAME} <${MailAddress.NO_REPLY}>`,
} as const;

export const MailSubject = {
  PAYMENT_CONFIRMED: "Your Valimail credits are ready",
  BULK_JOB_COMPLETED: "Your Valimail list is finished",
} as const;
