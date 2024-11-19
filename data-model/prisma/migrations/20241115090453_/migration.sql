/*
  Warnings:

  - Added the required column `createrId` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CampaignDomain` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createrId` to the `CampaignDomainQuizSet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CampaignDomainQuizSet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Domain` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `QuestionOption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UserJob` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "createrId" TEXT NOT NULL,
ADD COLUMN     "updaterId" TEXT;

-- AlterTable
ALTER TABLE "CampaignDomain" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "languageIds" TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "CampaignDomainQuizSet" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createrId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updaterId" TEXT;

-- AlterTable
ALTER TABLE "Domain" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "QuestionOption" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "UserCampaignDomainLog" ADD COLUMN     "activityId" TEXT,
ADD COLUMN     "jobId" TEXT;

-- AlterTable
ALTER TABLE "UserJob" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "domainId" TEXT;
