/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `organization` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `organization` table. All the data in the column will be lost.
  - Added the required column `inviterId` to the `organization_invitation` table without a default value. This is not possible if the table is not empty.

*/
-- Step 1: Add inviterId as nullable first to handle existing data
ALTER TABLE "organization_invitation" ADD COLUMN "inviterId" TEXT;

-- Step 2: Populate inviterId for existing invitations with the organization owner
UPDATE "organization_invitation"
SET "inviterId" = "organization"."ownerId"
FROM "organization"
WHERE "organization_invitation"."organizationId" = "organization"."id"
AND "organization_invitation"."inviterId" IS NULL;

-- Step 3: Make inviterId NOT NULL now that it's populated
ALTER TABLE "organization_invitation" ALTER COLUMN "inviterId" SET NOT NULL;

-- Step 4: Add foreign key constraint for inviterId
ALTER TABLE "organization_invitation" ADD CONSTRAINT "organization_invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 5: Now we can safely drop the ownerId column and its constraints
-- DropForeignKey
ALTER TABLE "organization" DROP CONSTRAINT "organization_ownerId_fkey";

-- DropIndex
DROP INDEX "organization_ownerId_idx";

-- AlterTable
ALTER TABLE "organization" DROP COLUMN "deletedAt",
DROP COLUMN "ownerId",
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "metadata" TEXT;

-- AlterTable
ALTER TABLE "session" ADD COLUMN     "activeOrganizationId" TEXT;

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "organization_invitation_organizationId_idx" ON "organization_invitation"("organizationId");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");
