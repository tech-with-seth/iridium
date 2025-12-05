/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `invitation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId,userId]` on the table `member` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `token` to the `invitation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invitation" ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "token" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "member" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "invitation_token_key" ON "invitation"("token");

-- CreateIndex
CREATE INDEX "invitation_token_idx" ON "invitation"("token");

-- CreateIndex
CREATE UNIQUE INDEX "member_organizationId_userId_key" ON "member"("organizationId", "userId");
