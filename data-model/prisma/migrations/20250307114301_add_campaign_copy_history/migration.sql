/*
  Warnings:

  - A unique constraint covering the columns `[contentCopyHistoryId]` on the table `Campaign` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "contentCopyHistoryId" TEXT;

-- CreateTable
CREATE TABLE "ContentCopyHistory" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "targetCampaignId" TEXT,
    "imageCampaignId" TEXT,
    "uiLanguageCampaignId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentCopyHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_contentCopyHistoryId_key" ON "Campaign"("contentCopyHistoryId");

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_contentCopyHistoryId_fkey" FOREIGN KEY ("contentCopyHistoryId") REFERENCES "ContentCopyHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
