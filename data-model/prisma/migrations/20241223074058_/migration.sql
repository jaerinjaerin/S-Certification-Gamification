/*
  Warnings:

  - A unique constraint covering the columns `[userId,campaignId,quizStageId]` on the table `UserQuizBadgeStageLog` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UserQuizBadgeStageLog_userId_campaignId_key";

-- CreateIndex
CREATE UNIQUE INDEX "UserQuizBadgeStageLog_userId_campaignId_quizStageId_key" ON "UserQuizBadgeStageLog"("userId", "campaignId", "quizStageId");
