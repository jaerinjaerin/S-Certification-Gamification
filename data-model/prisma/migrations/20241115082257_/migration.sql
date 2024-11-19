/*
  Warnings:

  - You are about to drop the column `expiresIn` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `lifeCount` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `activityId` on the `UserQuizQuestionLog` table. All the data in the column will be lost.
  - You are about to drop the column `campaignActivityId` on the `UserQuizQuestionLog` table. All the data in the column will be lost.
  - You are about to drop the column `countryCode` on the `UserQuizQuestionLog` table. All the data in the column will be lost.
  - You are about to drop the column `languageCode` on the `UserQuizQuestionLog` table. All the data in the column will be lost.
  - You are about to drop the column `activityId` on the `UserQuizStageLog` table. All the data in the column will be lost.
  - You are about to drop the column `campaignActivityId` on the `UserQuizStageLog` table. All the data in the column will be lost.
  - You are about to drop the column `countryCode` on the `UserQuizStageLog` table. All the data in the column will be lost.
  - You are about to drop the column `languageCode` on the `UserQuizStageLog` table. All the data in the column will be lost.
  - You are about to drop the `CampaignActivity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Country` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CountryLanguage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuestionOptionTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuestionTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuestionUsage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserCampaignActivityLog` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `endedAt` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startedAt` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `languageId` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeLimitSeconds` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isCorrect` to the `QuestionOption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `languageId` to the `QuestionOption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lifeCount` to the `QuizStage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `campaignDomainId` to the `UserQuizQuestionLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `countryId` to the `UserQuizQuestionLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `campaignDomainId` to the `UserQuizStageLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `countryId` to the `UserQuizStageLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CampaignActivity" DROP CONSTRAINT "CampaignActivity_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "CampaignActivity" DROP CONSTRAINT "CampaignActivity_countryId_fkey";

-- DropForeignKey
ALTER TABLE "CountryLanguage" DROP CONSTRAINT "CountryLanguage_countryId_fkey";

-- DropForeignKey
ALTER TABLE "CountryLanguage" DROP CONSTRAINT "CountryLanguage_languageId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionOptionTranslation" DROP CONSTRAINT "QuestionOptionTranslation_optionId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionTranslation" DROP CONSTRAINT "QuestionTranslation_questionId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionUsage" DROP CONSTRAINT "QuestionUsage_countryId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionUsage" DROP CONSTRAINT "QuestionUsage_questionId_fkey";

-- DropForeignKey
ALTER TABLE "UserCampaignActivityLog" DROP CONSTRAINT "UserCampaignActivityLog_campaignActivityId_fkey";

-- DropForeignKey
ALTER TABLE "UserCampaignActivityLog" DROP CONSTRAINT "UserCampaignActivityLog_userId_fkey";

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "endedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "expiresIn",
DROP COLUMN "lifeCount",
ADD COLUMN     "languageId" TEXT NOT NULL,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "timeLimitSeconds" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "QuestionOption" ADD COLUMN     "isCorrect" BOOLEAN NOT NULL,
ADD COLUMN     "languageId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "QuizStage" ADD COLUMN     "lifeCount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UserQuizQuestionLog" DROP COLUMN "activityId",
DROP COLUMN "campaignActivityId",
DROP COLUMN "countryCode",
DROP COLUMN "languageCode",
ADD COLUMN     "campaignDomainId" TEXT NOT NULL,
ADD COLUMN     "countryId" TEXT NOT NULL,
ADD COLUMN     "languageId" TEXT;

-- AlterTable
ALTER TABLE "UserQuizStageLog" DROP COLUMN "activityId",
DROP COLUMN "campaignActivityId",
DROP COLUMN "countryCode",
DROP COLUMN "languageCode",
ADD COLUMN     "campaignDomainId" TEXT NOT NULL,
ADD COLUMN     "countryId" TEXT NOT NULL;

-- DropTable
DROP TABLE "CampaignActivity";

-- DropTable
DROP TABLE "Country";

-- DropTable
DROP TABLE "CountryLanguage";

-- DropTable
DROP TABLE "QuestionOptionTranslation";

-- DropTable
DROP TABLE "QuestionTranslation";

-- DropTable
DROP TABLE "QuestionUsage";

-- DropTable
DROP TABLE "UserCampaignActivityLog";

-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignDomain" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,

    CONSTRAINT "CampaignDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignDomainQuizSet" (
    "id" TEXT NOT NULL,
    "campaignDomainId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "questionIds" TEXT NOT NULL,

    CONSTRAINT "CampaignDomainQuizSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCampaignDomainLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL,
    "lastCompletedStage" INTEGER,
    "timeSpent" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignDomainId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "languageId" TEXT,

    CONSTRAINT "UserCampaignDomainLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Domain_name_key" ON "Domain"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_code_key" ON "Domain"("code");

-- CreateIndex
CREATE UNIQUE INDEX "UserCampaignDomainLog_userId_campaignId_key" ON "UserCampaignDomainLog"("userId", "campaignId");

-- AddForeignKey
ALTER TABLE "CampaignDomain" ADD CONSTRAINT "CampaignDomain_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignDomain" ADD CONSTRAINT "CampaignDomain_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignDomainQuizSet" ADD CONSTRAINT "CampaignDomainQuizSet_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignDomainQuizSet" ADD CONSTRAINT "CampaignDomainQuizSet_campaignDomainId_fkey" FOREIGN KEY ("campaignDomainId") REFERENCES "CampaignDomain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCampaignDomainLog" ADD CONSTRAINT "UserCampaignDomainLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
