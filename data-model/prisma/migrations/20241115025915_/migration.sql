/*
  Warnings:

  - You are about to drop the column `isCompleted` on the `UserCampaignActivityLog` table. All the data in the column will be lost.
  - You are about to drop the `UserQuizHistory` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,campaignId,campaignActivityId]` on the table `UserCampaignActivityLog` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `campaignId` to the `UserCampaignActivityLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `completed` to the `UserCampaignActivityLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserQuizHistory" DROP CONSTRAINT "UserQuizHistory_userId_fkey";

-- AlterTable
ALTER TABLE "UserCampaignActivityLog" DROP COLUMN "isCompleted",
ADD COLUMN     "campaignId" TEXT NOT NULL,
ADD COLUMN     "completed" BOOLEAN NOT NULL;

-- DropTable
DROP TABLE "UserQuizHistory";

-- CreateIndex
CREATE UNIQUE INDEX "UserCampaignActivityLog_userId_campaignId_campaignActivityI_key" ON "UserCampaignActivityLog"("userId", "campaignId", "campaignActivityId");
