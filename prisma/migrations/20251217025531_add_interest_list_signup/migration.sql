-- CreateTable
CREATE TABLE "interest_list_signup" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,

    CONSTRAINT "interest_list_signup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "interest_list_signup_email_key" ON "interest_list_signup"("email");

-- CreateIndex
CREATE INDEX "interest_list_signup_email_idx" ON "interest_list_signup"("email");
