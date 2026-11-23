import { AxiosError } from "axios";

export class ErrorMessageHelper {
  static toMessage(error: unknown, fallback = "Unexpected error"): string {
    if (error instanceof AxiosError) {
      const data = error.response?.data;
      if (typeof data === "string" && data.trim()) {
        return data.trim().slice(0, 500);
      }
      if (data && typeof data === "object") {
        const body = data as { error?: unknown; message?: unknown };
        if (typeof body.error === "string" && body.error.trim()) {
          return body.error.trim();
        }
        if (typeof body.message === "string" && body.message.trim()) {
          return body.message.trim();
        }
      }
      return error.message || fallback;
    }
    if (error instanceof Error) return error.message;
    return fallback;
  }
}
