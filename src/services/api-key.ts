import {
  MAX_ACTIVE_API_KEYS,
  MAX_API_KEY_NAME_LENGTH,
} from "@/constants/validation";
import { ApiKeyHelper } from "@/helpers/api-key";
import { ApiKeyRepository } from "@/repositories/api-key";
import { UserService } from "@/services/user";
import type {
  ApiKeyCreatedResponse,
  ApiKeyListResponse,
  ApiKeyRecord,
} from "@/types/api";
import type { ApiKey } from "@/generated/prisma/client";

type UserParams = {
  clerkId: string;
  emailAddress: string;
};

export class ApiKeyLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiKeyLimitError";
  }
}

export class UnauthorizedApiKeyError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedApiKeyError";
  }
}

export class ApiKeyNotFoundError extends Error {
  constructor(message = "API key not found") {
    super(message);
    this.name = "ApiKeyNotFoundError";
  }
}

export class ApiKeyService {
  static async authenticate(token: string): Promise<UserParams> {
    const record = await ApiKeyRepository.findActiveByHash(ApiKeyHelper.hash(token));
    if (!record) {
      throw new UnauthorizedApiKeyError();
    }

    await ApiKeyRepository.touchLastUsed(record.id).catch(() => undefined);

    return {
      clerkId: record.user.clerkId,
      emailAddress: record.user.email,
    };
  }

  static async list(params: UserParams): Promise<ApiKeyListResponse> {
    const user = await UserService.ensureUser(params.clerkId, params.emailAddress);
    const keys = await ApiKeyRepository.listForUser(user.id);
    return { keys: keys.map(ApiKeyService.toRecord) };
  }

  static async create(
    params: UserParams & { name: string },
  ): Promise<ApiKeyCreatedResponse> {
    const name = params.name.trim();
    if (!name) {
      throw new Error("Name is required");
    }
    if (name.length > MAX_API_KEY_NAME_LENGTH) {
      throw new Error(`Name must be ${MAX_API_KEY_NAME_LENGTH} characters or fewer`);
    }

    const user = await UserService.ensureUser(params.clerkId, params.emailAddress);
    const active = await ApiKeyRepository.countActive(user.id);
    if (active >= MAX_ACTIVE_API_KEYS) {
      throw new ApiKeyLimitError(
        `You can have ${MAX_ACTIVE_API_KEYS} active keys. Revoke one to create another.`,
      );
    }

    const key = ApiKeyHelper.generateSecret();
    const created = await ApiKeyRepository.create({
      userId: user.id,
      name,
      prefix: ApiKeyHelper.displayPrefix(key),
      keyHash: ApiKeyHelper.hash(key),
    });

    return { ...ApiKeyService.toRecord(created), key };
  }

  static async revoke(params: UserParams & { id: string }): Promise<ApiKeyRecord> {
    const user = await UserService.ensureUser(params.clerkId, params.emailAddress);
    const revoked = await ApiKeyRepository.revokeForUser(params.id, user.id);
    if (!revoked) throw new ApiKeyNotFoundError();
    return ApiKeyService.toRecord(revoked);
  }

  private static toRecord(key: ApiKey): ApiKeyRecord {
    return {
      id: key.id,
      name: key.name,
      prefix: key.prefix,
      createdAt: key.createdAt.toISOString(),
      lastUsedAt: key.lastUsedAt?.toISOString() ?? null,
      revokedAt: key.revokedAt?.toISOString() ?? null,
    };
  }
}
