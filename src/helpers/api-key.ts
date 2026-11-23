import { createHash, randomBytes } from "node:crypto";
import {
  API_KEY_PREFIX,
  API_KEY_PREFIX_RANDOM_LENGTH,
  API_KEY_SECRET_BYTES,
} from "@/constants/validation";

export class ApiKeyHelper {
  static generateSecret(): string {
    return `${API_KEY_PREFIX}${randomBytes(API_KEY_SECRET_BYTES).toString("base64url")}`;
  }

  static displayPrefix(secret: string): string {
    return secret.slice(0, API_KEY_PREFIX.length + API_KEY_PREFIX_RANDOM_LENGTH);
  }

  static hash(secret: string): string {
    return createHash("sha256").update(secret).digest("hex");
  }

  static hasLivePrefix(token: string): boolean {
    return token.startsWith(API_KEY_PREFIX);
  }
}
