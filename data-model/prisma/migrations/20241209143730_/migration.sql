/*
  Warnings:

  - You are about to drop the `UserCampaignDomainLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserCampaignDomainLog" DROP CONSTRAINT "UserCampaignDomainLog_quizSetId_fkey";

-- DropForeignKey
ALTER TABLE "UserCampaignDomainLog" DROP CONSTRAINT "UserCampaignDomainLog_userId_fkey";

-- DropTable
DROP TABLE "UserCampaignDomainLog";

-- CreateTable
CREATE TABLE "UserQuizLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "firstBadgeStage" INTEGER,
    "isFirstBadgeStageCompleted" BOOLEAN,
    "isCompleted" BOOLEAN,
    "badgeAcquisitionDate" TIMESTAMP(3),
    "isBadgeAcquired" BOOLEAN,
    "lastCompletedStage" INTEGER,
    "timeSpent" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "jobId" TEXT,
    "quizSetId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "firstBadgeActivityId" TEXT,
    "lastBadgeActivityId" TEXT,
    "languageId" TEXT,
    "score" INTEGER,
    "quizsetPath" TEXT,

    CONSTRAINT "UserQuizLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserQuizLog" ADD CONSTRAINT "UserQuizLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuizLog" ADD CONSTRAINT "UserQuizLog_quizSetId_fkey" FOREIGN KEY ("quizSetId") REFERENCES "QuizSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
