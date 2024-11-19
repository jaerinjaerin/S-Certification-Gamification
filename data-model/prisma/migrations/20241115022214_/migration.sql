/*
  Warnings:

  - You are about to drop the `CountryActivity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CountryUserJobQuestion` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `activityId` to the `UserQuizSetLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CountryActivity" DROP CONSTRAINT "CountryActivity_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "CountryActivity" DROP CONSTRAINT "CountryActivity_countryId_fkey";

-- DropForeignKey
ALTER TABLE "CountryUserJobQuestion" DROP CONSTRAINT "CountryUserJobQuestion_countryId_fkey";

-- DropForeignKey
ALTER TABLE "CountryUserJobQuestion" DROP CONSTRAINT "CountryUserJobQuestion_questionId_fkey";

-- AlterTable
ALTER TABLE "UserQuizSetLog" ADD COLUMN     "activityId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "CountryActivity";

-- DropTable
DROP TABLE "CountryUserJobQuestion";

-- CreateTable
CREATE TABLE "CampaignActivity" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "jobId" TEXT NOT NULL,
    "jobName" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,

    CONSTRAINT "CampaignActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionUsage" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "userJobId" TEXT NOT NULL,
    "userJobName" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "QuestionUsage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CampaignActivity" ADD CONSTRAINT "CampaignActivity_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignActivity" ADD CONSTRAINT "CampaignActivity_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionUsage" ADD CONSTRAINT "QuestionUsage_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionUsage" ADD CONSTRAINT "QuestionUsage_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
