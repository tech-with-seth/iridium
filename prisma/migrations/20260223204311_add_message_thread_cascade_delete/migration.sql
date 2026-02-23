-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_threadId_fkey";

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
