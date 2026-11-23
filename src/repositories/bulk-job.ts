import { prisma } from "@/lib/prisma";

export class BulkJobRepository {
  static async create(data: {
    userId: string;
    name: string | null;
    reacherJobId: string;
    status: string;
    totalRecords: number;
  }) {
    return prisma.bulkJob.create({ data });
  }

  static async findByIdForUser(id: string, userId: string) {
    return prisma.bulkJob.findFirst({
      where: { id, userId },
    });
  }

  static async listForUser(userId: string, take: number) {
    return prisma.bulkJob.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take,
    });
  }

  static async updateFromStatus(
    id: string,
    data: {
      status: string;
      totalRecords: number;
      totalProcessed: number;
      summarySafe: number;
      summaryRisky: number;
      summaryInvalid: number;
      summaryUnknown: number;
      finishedAt: Date | null;
    },
  ) {
    return prisma.bulkJob.update({
      where: { id },
      data,
    });
  }
}
