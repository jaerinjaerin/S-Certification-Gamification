/*
  Warnings:

  - A unique constraint covering the columns `[userId,campaignId]` on the table `UserCampaignDomainLog` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CampaignDomain" ALTER COLUMN "languageIds" SET NOT NULL,
ALTER COLUMN "languageIds" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "UserCampaignDomainLog_userId_campaignId_key" ON "UserCampaignDomainLog"("userId", "campaignId");
