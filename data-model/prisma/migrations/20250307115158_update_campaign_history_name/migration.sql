/*
  Warnings:

  - You are about to drop the column `targetCampaignSlug` on the `ContentCopyHistory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ContentCopyHistory" DROP COLUMN "targetCampaignSlug",
ADD COLUMN     "targetCampaignName" TEXT;
