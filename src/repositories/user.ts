import { prisma } from "@/lib/prisma";

export class UserRepository {
  static async findByClerkId(clerkId: string) {
    return prisma.user.findUnique({ where: { clerkId } });
  }

  static async upsertByClerkId(clerkId: string, email: string) {
    return prisma.user.upsert({
      where: { clerkId },
      create: { clerkId, email },
      update: { email },
    });
  }
}
