-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateIndex
CREATE INDEX "user_email_idx" ON "public"."user"("email");
