/*
  Warnings:

  - Added the required column `campaignId` to the `UserQuizQuestionLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserCampaignDomainLog" ADD COLUMN     "score" INTEGER;

-- AlterTable
ALTER TABLE "UserQuizQuestionLog" ADD COLUMN     "campaignId" TEXT NOT NULL,
ALTER COLUMN "score" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserQuizStageLog" ADD COLUMN     "score" INTEGER;
