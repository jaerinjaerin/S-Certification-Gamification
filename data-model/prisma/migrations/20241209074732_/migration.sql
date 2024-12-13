/*
  Warnings:

  - You are about to drop the column `campaignDomainQuizSetId` on the `QuizStage` table. All the data in the column will be lost.
  - You are about to drop the column `campaignDomainQuizSetId` on the `UserCampaignDomainLog` table. All the data in the column will be lost.
  - You are about to drop the column `campaignDomainQuizSetId` on the `UserQuizStageLog` table. All the data in the column will be lost.
  - You are about to drop the `CampaignDomainQuizSet` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `quizSetId` to the `UserQuizStageLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CampaignDomainQuizSet" DROP CONSTRAINT "CampaignDomainQuizSet_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "CampaignDomainQuizSet" DROP CONSTRAINT "CampaignDomainQuizSet_domainId_fkey";

-- DropForeignKey
ALTER TABLE "CampaignDomainQuizSet" DROP CONSTRAINT "CampaignDomainQuizSet_languageId_fkey";

-- DropForeignKey
ALTER TABLE "QuizStage" DROP CONSTRAINT "QuizStage_campaignDomainQuizSetId_fkey";

-- DropForeignKey
ALTER TABLE "UserCampaignDomainLog" DROP CONSTRAINT "UserCampaignDomainLog_campaignDomainQuizSetId_fkey";

-- AlterTable
ALTER TABLE "QuizStage" DROP COLUMN "campaignDomainQuizSetId";

-- AlterTable
ALTER TABLE "UserCampaignDomainLog" DROP COLUMN "campaignDomainQuizSetId";

-- AlterTable
ALTER TABLE "UserQuizStageLog" DROP COLUMN "campaignDomainQuizSetId",
ADD COLUMN     "quizSetId" TEXT NOT NULL;

-- DropTable
DROP TABLE "CampaignDomainQuizSet";
