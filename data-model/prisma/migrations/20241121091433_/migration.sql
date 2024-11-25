-- CreateTable
CREATE TABLE "VerifyToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerifyToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VerifyToken_email_idx" ON "VerifyToken"("email");

-- CreateIndex
CREATE INDEX "VerifyToken_token_idx" ON "VerifyToken"("token");
