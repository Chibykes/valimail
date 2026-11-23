import { prisma } from "@/lib/prisma";

export class ApiKeyRepository {
  static async findActiveByHash(keyHash: string) {
    return prisma.apiKey.findFirst({
      where: { keyHash, revokedAt: null },
      include: { user: true },
    });
  }

  static async listForUser(userId: string) {
    return prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async countActive(userId: string) {
    return prisma.apiKey.count({
      where: { userId, revokedAt: null },
    });
  }

  static async create(data: {
    userId: string;
    name: string;
    prefix: string;
    keyHash: string;
  }) {
    return prisma.apiKey.create({ data });
  }

  static async touchLastUsed(id: string) {
    return prisma.apiKey.update({
      where: { id },
      data: { lastUsedAt: new Date() },
    });
  }

  static async revokeForUser(id: string, userId: string) {
    const existing = await prisma.apiKey.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;
    if (existing.revokedAt) return existing;
    return prisma.apiKey.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }
}
