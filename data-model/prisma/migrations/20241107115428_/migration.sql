/*
  Warnings:

  - You are about to drop the column `quizCampaignId` on the `UserQuizHistory` table. All the data in the column will be lost.
  - You are about to drop the column `quizMetadataId` on the `UserQuizHistory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,campaignId,metadataId]` on the table `UserQuizHistory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `campaignId` to the `UserQuizHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `metadataId` to the `UserQuizHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "UserQuizHistory_userId_quizCampaignId_quizMetadataId_key";

-- AlterTable
ALTER TABLE "UserQuizHistory" DROP COLUMN "quizCampaignId",
DROP COLUMN "quizMetadataId",
ADD COLUMN     "campaignId" TEXT NOT NULL,
ADD COLUMN     "metadataId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserQuizHistory_userId_campaignId_metadataId_key" ON "UserQuizHistory"("userId", "campaignId", "metadataId");
