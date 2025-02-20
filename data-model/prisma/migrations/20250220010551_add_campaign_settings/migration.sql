/*
  Warnings:

  - You are about to drop the `BadgeStage` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[settingsId]` on the table `Campaign` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "settingsId" TEXT;

-- DropTable
DROP TABLE "BadgeStage";

-- DropEnum
DROP TYPE "BadgeType";

-- CreateTable
CREATE TABLE "CampaignSettings" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "totalStages" INTEGER,
    "firstBadgeName" TEXT NOT NULL,
    "secondBadgeName" TEXT NOT NULL,
    "ffFirstStageIndex" INTEGER,
    "ffSecondStageIndex" INTEGER,
    "fsmFirstStageIndex" INTEGER,
    "fsmSecondStageIndex" INTEGER,

    CONSTRAINT "CampaignSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_settingsId_key" ON "Campaign"("settingsId");

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "CampaignSettings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
