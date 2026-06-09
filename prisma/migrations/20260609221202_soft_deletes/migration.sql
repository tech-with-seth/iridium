-- DropIndex
DROP INDEX "note_userId_idx";

-- AlterTable
ALTER TABLE "note" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "thread" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "message_threadId_createdAt_idx" ON "message"("threadId", "createdAt");

-- CreateIndex
CREATE INDEX "note_userId_deletedAt_idx" ON "note"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "thread_createdById_deletedAt_idx" ON "thread"("createdById", "deletedAt");
