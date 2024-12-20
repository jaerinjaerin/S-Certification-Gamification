/*
  Warnings:

  - A unique constraint covering the columns `[userId,campaignId]` on the table `UserQuizLog` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "backgroundImageUrl" TEXT,
ADD COLUMN     "characterImageUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "UserQuizLog_userId_campaignId_key" ON "UserQuizLog"("userId", "campaignId");
