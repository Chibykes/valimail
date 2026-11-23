import { SignalTone } from "@/constants/validation";
import type { ReacherCheckEmailResult } from "@/types/reacher";

export type ResultSignal = {
  key: string;
  label: string;
  value: string;
  tone: SignalTone;
};

type Flag = boolean | undefined | null;

export class ResultSignalsHelper {
  static fromResult(result: ReacherCheckEmailResult): ResultSignal[] {
    const mxRecords = result.mx?.records?.length ?? 0;

    return [
      this.positive("syntax", "Format", result.syntax?.is_valid_syntax, "Valid", "Malformed"),
      {
        key: "mx",
        label: "Domain",
        value: result.mx?.accepts_mail
          ? `${mxRecords} MX record${mxRecords === 1 ? "" : "s"}`
          : "No mail server",
        tone: this.toneFor(result.mx?.accepts_mail),
      },
      this.positive("smtp", "Mailbox", result.smtp?.is_deliverable, "Exists", "Not found"),
      this.negative("catch-all", "Catch-all", result.smtp?.is_catch_all, "Yes", "No", SignalTone.WARN),
      this.negative("disposable", "Disposable", result.misc?.is_disposable, "Yes", "No", SignalTone.BAD),
      this.negative("role", "Role account", result.misc?.is_role_account, "Yes", "No", SignalTone.WARN),
      this.negative("full-inbox", "Full inbox", result.smtp?.has_full_inbox, "Yes", "No", SignalTone.WARN),
      this.negative("disabled", "Disabled", result.smtp?.is_disabled, "Yes", "No", SignalTone.BAD),
    ];
  }

  static reason(result: ReacherCheckEmailResult): string {
    if (result.syntax?.is_valid_syntax === false) return "Malformed address";
    if (result.mx?.accepts_mail === false) return "No mail server";
    if (result.smtp?.is_disabled) return "Mailbox disabled";
    if (result.misc?.is_disposable) return "Disposable provider";
    if (result.smtp?.is_catch_all) return "Catch-all domain";
    if (result.smtp?.has_full_inbox) return "Inbox full";
    if (result.misc?.is_role_account) return "Role account";
    if (result.smtp?.is_deliverable === false) return "Mailbox not found";
    if (result.smtp?.is_deliverable) return "Mailbox exists";
    return "No clear answer";
  }

  private static positive(
    key: string,
    label: string,
    flag: Flag,
    yes: string,
    no: string,
  ): ResultSignal {
    return {
      key,
      label,
      value: flag === undefined || flag === null ? "—" : flag ? yes : no,
      tone: this.toneFor(flag),
    };
  }

  private static negative(
    key: string,
    label: string,
    flag: Flag,
    yes: string,
    no: string,
    badTone: SignalTone,
  ): ResultSignal {
    if (flag === undefined || flag === null) {
      return { key, label, value: "—", tone: SignalTone.NEUTRAL };
    }
    return {
      key,
      label,
      value: flag ? yes : no,
      tone: flag ? badTone : SignalTone.GOOD,
    };
  }

  private static toneFor(flag: Flag): SignalTone {
    if (flag === undefined || flag === null) return SignalTone.NEUTRAL;
    return flag ? SignalTone.GOOD : SignalTone.BAD;
  }
}
