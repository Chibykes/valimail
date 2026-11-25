import { AxiosError } from "axios";
import { NextResponse } from "next/server";
import { ErrorMessageHelper } from "@/helpers/error-message";
import { InsufficientCreditsError } from "@/helpers/credit-error";
import type { ApiErrorBody } from "@/types/api";

export class ApiErrorHelper {
  static toMessage(error: unknown, fallback = "Unexpected error"): string {
    return ErrorMessageHelper.toMessage(error, fallback);
  }

  static response(
    status: number,
    error: string,
    details?: unknown,
  ): NextResponse<ApiErrorBody> {
    return NextResponse.json({ error, details }, { status });
  }

  static unauthorized(message = "Unauthorized") {
    return this.response(401, message);
  }

  static badRequest(message: string, details?: unknown) {
    return this.response(400, message, details);
  }

  static notFound(message = "Not found") {
    return this.response(404, message);
  }

  static insufficientCredits(error: InsufficientCreditsError) {
    return NextResponse.json(
      {
        error: error.message,
        balance: error.balance,
        required: error.required,
        details: "INSUFFICIENT_CREDITS",
      },
      { status: 402 },
    );
  }

  /** Overload used by route handlers: json(error, status, fallbackMessage) */
  static json(
    errorOrStatus: unknown,
    statusOrError?: number | string,
    fallbackOrCode?: string,
  ): NextResponse<ApiErrorBody> {
    if (typeof errorOrStatus === "number" && typeof statusOrError === "string") {
      return this.response(errorOrStatus, statusOrError, fallbackOrCode);
    }

    const fallback =
      typeof fallbackOrCode === "string" ? fallbackOrCode : "Unexpected error";
    const status =
      typeof statusOrError === "number" ? statusOrError : 500;
    const message = this.toMessage(errorOrStatus, fallback);

    if (errorOrStatus instanceof AxiosError) {
      return this.response(
        errorOrStatus.response?.status ?? status,
        message,
        "UPSTREAM_ERROR",
      );
    }

    return this.response(status, message);
  }

  static fromUnknown(
    error: unknown,
    fallbackStatus = 500,
  ): NextResponse<ApiErrorBody> {
    const message = this.toMessage(error);
    const lower = message.toLowerCase();
    if (lower.includes("unauthorized")) return this.unauthorized(message);
    if (lower.includes("not found")) return this.notFound(message);
    if (
      lower.includes("invalid email") ||
      lower.includes("no valid emails") ||
      lower.includes("required")
    ) {
      return this.badRequest(message);
    }
    return this.json(error, fallbackStatus, message);
  }
}
