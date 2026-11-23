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
}
