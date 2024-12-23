/*
  Warnings:

  - You are about to drop the column `isBadgeStage` on the `QuizStage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "QuizStage" DROP COLUMN "isBadgeStage",
ADD COLUMN     "iearchBadgeStage" BOOLEAN;

-- CreateTable
CREATE TABLE "CampaignDomainGoal" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "userCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignDomainGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserQuizBadgeLog" (
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

    CONSTRAINT "UserQuizBadgeLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserQuizBadgeLog_userId_campaignId_key" ON "UserQuizBadgeLog"("userId", "campaignId");

-- AddForeignKey
ALTER TABLE "CampaignDomainGoal" ADD CONSTRAINT "CampaignDomainGoal_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignDomainGoal" ADD CONSTRAINT "CampaignDomainGoal_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
