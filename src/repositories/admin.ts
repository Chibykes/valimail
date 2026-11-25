import { Prisma } from "@/generated/prisma/client";
import { ADMIN_LIST_LIMIT, ADMIN_NOTE_MAX_LENGTH } from "@/constants/admin";
import { CreditReason } from "@/constants/billing";
import { BULK_CLAIM_STALE_MS, BulkJobStatus } from "@/constants/validation";
import { prisma } from "@/lib/prisma";

export class AdminBalanceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminBalanceError";
  }
}

export class AdminJobError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminJobError";
  }
}

export class AdminRepository {
  static async overview() {
    const [users, credits, groups, activeJobs] = await Promise.all([
      prisma.user.count(),
      prisma.user.aggregate({ _sum: { creditBalance: true } }),
      prisma.bulkJob.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.bulkJob.findMany({
        where: { status: { in: [BulkJobStatus.PENDING, BulkJobStatus.RUNNING] } },
        include: { user: { select: { email: true } } },
        orderBy: { createdAt: "asc" },
        take: ADMIN_LIST_LIMIT,
      }),
    ]);

    const counts = {
      pending: 0,
      running: 0,
      completed: 0,
      cancelled: 0,
    };
    for (const group of groups) {
      if (group.status === BulkJobStatus.PENDING) counts.pending = group._count._all;
      if (group.status === BulkJobStatus.RUNNING) counts.running = group._count._all;
      if (group.status === BulkJobStatus.COMPLETED) counts.completed = group._count._all;
      if (group.status === BulkJobStatus.CANCELLED) counts.cancelled = group._count._all;
    }

    return {
      users,
      creditSum: credits._sum.creditBalance ?? 0,
      counts,
      activeJobs,
    };
  }

  static async listUsers(query: string) {
    const needle = query.trim();
    return prisma.user.findMany({
      where: needle
        ? { email: { contains: needle, mode: "insensitive" } }
        : undefined,
      orderBy: { createdAt: "desc" },
      take: ADMIN_LIST_LIMIT,
      select: {
        id: true,
        email: true,
        creditBalance: true,
        createdAt: true,
      },
    });
  }

  static async adjustBalance(params: { userId: string; delta: number; note: string }) {
    const note = params.note.trim();
    if (!Number.isInteger(params.delta) || params.delta === 0) {
      throw new AdminBalanceError("Enter a non-zero whole number of credits.");
    }
    if (!note || note.length > ADMIN_NOTE_MAX_LENGTH) {
      throw new AdminBalanceError(`Add a note up to ${ADMIN_NOTE_MAX_LENGTH} characters.`);
    }

    return prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT id FROM "User" WHERE id = ${params.userId} FOR UPDATE`;
      const user = await tx.user.findUnique({ where: { id: params.userId } });
      if (!user) throw new AdminBalanceError("User not found.");
      const next = user.creditBalance + params.delta;
      if (next < 0) {
        throw new AdminBalanceError("Balance cannot go below 0.");
      }
      const updated = await tx.user.update({
        where: { id: user.id },
        data: { creditBalance: { increment: params.delta } },
      });
      await tx.creditLedger.create({
        data: {
          userId: user.id,
          delta: params.delta,
          balanceAfter: updated.creditBalance,
          reason: CreditReason.ADMIN,
          referenceId: note,
        },
      });
      return updated.creditBalance;
    });
  }

  static async listJobs(status?: string) {
    return prisma.bulkJob.findMany({
      where: status ? { status } : undefined,
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
      take: ADMIN_LIST_LIMIT,
    });
  }

  static async cancelPending(jobId: string) {
    return prisma.$transaction(async (tx) => {
      const job = await tx.bulkJob.findUnique({ where: { id: jobId } });
      if (!job) throw new AdminJobError("List not found.");
      if (job.status !== BulkJobStatus.PENDING) {
        throw new AdminJobError("Only a pending list can be cancelled.");
      }
      if (
        job.claimedAt &&
        Date.now() - job.claimedAt.getTime() < BULK_CLAIM_STALE_MS
      ) {
        throw new AdminJobError("This list is starting. Try again shortly.");
      }

      await tx.$executeRaw`SELECT id FROM "User" WHERE id = ${job.userId} FOR UPDATE`;
      const fresh = await tx.bulkJob.findUnique({ where: { id: jobId } });
      if (!fresh || fresh.status !== BulkJobStatus.PENDING) {
        throw new AdminJobError("Only a pending list can be cancelled.");
      }

      const cancelled = await tx.bulkJob.updateMany({
        where: { id: jobId, status: BulkJobStatus.PENDING },
        data: {
          status: BulkJobStatus.CANCELLED,
          inputEmails: Prisma.DbNull,
          claimedAt: null,
          finishedAt: new Date(),
        },
      });
      if (cancelled.count !== 1) {
        throw new AdminJobError("Only a pending list can be cancelled.");
      }

      if (fresh.totalRecords <= 0) {
        const user = await tx.user.findUniqueOrThrow({ where: { id: fresh.userId } });
        return { refunded: 0, balance: user.creditBalance };
      }

      const user = await tx.user.update({
        where: { id: fresh.userId },
        data: { creditBalance: { increment: fresh.totalRecords } },
      });
      await tx.creditLedger.create({
        data: {
          userId: fresh.userId,
          delta: fresh.totalRecords,
          balanceAfter: user.creditBalance,
          reason: CreditReason.REFUND,
          referenceId: fresh.id,
        },
      });
      return { refunded: fresh.totalRecords, balance: user.creditBalance };
    });
  }
}
