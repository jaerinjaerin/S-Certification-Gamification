/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Campaign` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "slug" TEXT DEFAULT 's25';

-- AlterTable
ALTER TABLE "CampaignSettings" ALTER COLUMN "firstBadgeName" DROP NOT NULL,
ALTER COLUMN "secondBadgeName" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_slug_key" ON "Campaign"("slug");
