/*
  Warnings:

  - You are about to drop the column `activityId` on the `CampaignDomainQuizSet` table. All the data in the column will be lost.
  - You are about to drop the column `completed` on the `UserCampaignDomainLog` table. All the data in the column will be lost.
  - You are about to drop the column `campaignDomainId` on the `UserQuizQuestionLog` table. All the data in the column will be lost.
  - You are about to drop the column `campaignDomainId` on the `UserQuizStageLog` table. All the data in the column will be lost.
  - Added the required column `campaignDomainQuizSetId` to the `UserQuizStageLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CampaignDomainQuizSet" DROP COLUMN "activityId",
ADD COLUMN     "firstBadgeActivityId" TEXT,
ADD COLUMN     "firstBadgeStage" INTEGER,
ADD COLUMN     "lastBadgeActivityId" TEXT;

-- AlterTable
ALTER TABLE "UserCampaignDomainLog" DROP COLUMN "completed",
ADD COLUMN     "badgeAcquisitionDate" TIMESTAMP(3),
ADD COLUMN     "firstBadgeStage" INTEGER,
ADD COLUMN     "isBadgeAcquired" BOOLEAN,
ADD COLUMN     "isCompleted" BOOLEAN,
ADD COLUMN     "isFirstBadgeStageCompleted" BOOLEAN;

-- AlterTable
ALTER TABLE "UserQuizQuestionLog" DROP COLUMN "campaignDomainId";

-- AlterTable
ALTER TABLE "UserQuizStageLog" DROP COLUMN "campaignDomainId",
ADD COLUMN     "campaignDomainQuizSetId" TEXT NOT NULL,
ADD COLUMN     "isFirstBadgeStage" BOOLEAN;
