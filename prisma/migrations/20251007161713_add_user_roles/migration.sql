-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'EDITOR', 'ADMIN');

-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'USER';
