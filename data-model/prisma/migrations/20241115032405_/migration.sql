/*
  Warnings:

  - Added the required column `activityId` to the `UserCampaignActivityLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserCampaignActivityLog" ADD COLUMN     "activityId" TEXT NOT NULL;
