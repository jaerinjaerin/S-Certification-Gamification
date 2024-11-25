/*
  Warnings:

  - You are about to drop the column `activityId` on the `UserCampaignDomainLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserCampaignDomainLog" DROP COLUMN "activityId",
ADD COLUMN     "firstBadgeActivityId" TEXT,
ADD COLUMN     "lastBadgeActivityId" TEXT;
