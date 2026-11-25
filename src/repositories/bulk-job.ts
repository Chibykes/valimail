import { Prisma } from "@/generated/prisma/client";
import type { BulkJob } from "@/generated/prisma/client";
import {
  BULK_CLAIM_STALE_MS,
  BulkJobStatus,
  MAX_CONCURRENT_BULK_JOBS,
} from "@/constants/validation";
import { prisma } from "@/lib/prisma";

export class BulkJobRepository {
  static async findById(id: string) {
    return prisma.bulkJob.findUnique({ where: { id } });
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

  static async listRunning(userId: string) {
    return prisma.bulkJob.findMany({
      where: { userId, status: BulkJobStatus.RUNNING },
      orderBy: { createdAt: "asc" },
    });
  }

  static async listActiveUserIds(take: number) {
    const rows = await prisma.bulkJob.findMany({
      where: {
        status: { in: [BulkJobStatus.PENDING, BulkJobStatus.RUNNING] },
      },
      select: { userId: true },
      distinct: ["userId"],
      take,
    });
    return rows.map((row) => row.userId);
  }

  static async claimPending(userId: string): Promise<BulkJob[]> {
    const staleBefore = new Date(Date.now() - BULK_CLAIM_STALE_MS);
    return prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;
      const running = await tx.bulkJob.count({
        where: { userId, status: BulkJobStatus.RUNNING },
      });
      const slots = MAX_CONCURRENT_BULK_JOBS - running;
      if (slots <= 0) return [];

      const pending = await tx.bulkJob.findMany({
        where: {
          userId,
          status: BulkJobStatus.PENDING,
          OR: [{ claimedAt: null }, { claimedAt: { lt: staleBefore } }],
        },
        orderBy: { createdAt: "asc" },
        take: slots,
      });

      const now = new Date();
      const claimed: BulkJob[] = [];
      for (const job of pending) {
        const result = await tx.bulkJob.updateMany({
          where: {
            id: job.id,
            status: BulkJobStatus.PENDING,
            OR: [{ claimedAt: null }, { claimedAt: { lt: staleBefore } }],
          },
          data: { claimedAt: now },
        });
        if (result.count === 1) claimed.push(job);
      }
      return claimed;
    });
  }

  static async markSubmitted(id: string, reacherJobId: string) {
    const result = await prisma.bulkJob.updateMany({
      where: { id, status: BulkJobStatus.PENDING },
      data: {
        status: BulkJobStatus.RUNNING,
        reacherJobId,
        inputEmails: Prisma.DbNull,
        claimedAt: null,
      },
    });
    return result.count === 1;
  }

  static async releaseClaim(id: string) {
    return prisma.bulkJob.updateMany({
      where: { id, status: BulkJobStatus.PENDING },
      data: { claimedAt: null },
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
