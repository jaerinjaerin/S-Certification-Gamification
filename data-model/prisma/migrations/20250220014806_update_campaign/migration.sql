/*
  Warnings:

  - You are about to drop the column `ffFirstStageIndex` on the `CampaignSettings` table. All the data in the column will be lost.
  - You are about to drop the column `ffSecondStageIndex` on the `CampaignSettings` table. All the data in the column will be lost.
  - You are about to drop the column `fsmFirstStageIndex` on the `CampaignSettings` table. All the data in the column will be lost.
  - You are about to drop the column `fsmSecondStageIndex` on the `CampaignSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CampaignSettings" DROP COLUMN "ffFirstStageIndex",
DROP COLUMN "ffSecondStageIndex",
DROP COLUMN "fsmFirstStageIndex",
DROP COLUMN "fsmSecondStageIndex",
ADD COLUMN     "ffFirstBadgeStageIndex" INTEGER,
ADD COLUMN     "ffSecondBadgeStageIndex" INTEGER,
ADD COLUMN     "fsmFirstBadgeStageIndex" INTEGER,
ADD COLUMN     "fsmSecondBadgeStageIndex" INTEGER;
