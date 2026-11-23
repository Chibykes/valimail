-- DropIndex
DROP INDEX "BulkJob_userId_idx";

-- DropIndex
DROP INDEX "ValidationCheck_userId_idx";

-- AlterTable
ALTER TABLE "BulkJob" ADD COLUMN     "name" TEXT;

-- CreateIndex
CREATE INDEX "BulkJob_userId_createdAt_idx" ON "BulkJob"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ValidationCheck_userId_createdAt_idx" ON "ValidationCheck"("userId", "createdAt");
