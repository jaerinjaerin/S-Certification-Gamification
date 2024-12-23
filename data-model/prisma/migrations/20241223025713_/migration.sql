/*
  Warnings:

  - You are about to drop the column `iearchBadgeStage` on the `QuizStage` table. All the data in the column will be lost.
  - You are about to drop the `UserQuizBadgeLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "QuizStage" DROP COLUMN "iearchBadgeStage",
ADD COLUMN     "isBadgeStage" BOOLEAN;

-- DropTable
DROP TABLE "UserQuizBadgeLog";

-- CreateTable
CREATE TABLE "UserQuizBadgeStageLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "isBadgeAcquired" BOOLEAN,
    "timeSpent" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "quizSetId" TEXT NOT NULL,
    "quizStageId" TEXT NOT NULL,
    "quizStageIndex" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "domainId" TEXT,
    "languageId" TEXT,
    "jobId" TEXT,
    "regionId" TEXT,
    "subsidaryId" TEXT,
    "channelSegmentId" TEXT,
    "storeId" TEXT,
    "channelId" TEXT,

    CONSTRAINT "UserQuizBadgeStageLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserQuizBadgeStageLog_userId_campaignId_key" ON "UserQuizBadgeStageLog"("userId", "campaignId");
