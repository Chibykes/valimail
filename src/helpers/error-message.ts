import { AxiosError } from "axios";

export class ErrorMessageHelper {
  static toMessage(error: unknown, fallback = "Unexpected error"): string {
    if (error instanceof AxiosError) {
      const data = error.response?.data as
        | { error?: string; message?: string }
        | undefined;
      return data?.error || data?.message || error.message || fallback;
    }
    if (error instanceof Error) return error.message;
    return fallback;
  }
}
