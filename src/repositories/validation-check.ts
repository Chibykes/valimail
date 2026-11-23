import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export class ValidationCheckRepository {
  static async create(data: {
    userId: string;
    email: string;
    isReachable: string;
    rawResult: Prisma.InputJsonValue;
    source: string;
  }) {
    return prisma.validationCheck.create({ data });
  }

  static async listForUser(userId: string, take: number) {
    return prisma.validationCheck.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        email: true,
        isReachable: true,
        source: true,
        createdAt: true,
      },
    });
  }
}
