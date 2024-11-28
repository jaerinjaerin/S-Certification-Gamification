/*
  Warnings:

  - You are about to drop the column `countryId` on the `UserQuizQuestionLog` table. All the data in the column will be lost.
  - You are about to drop the column `timeSpent` on the `UserQuizQuestionLog` table. All the data in the column will be lost.
  - You are about to drop the column `countryId` on the `UserQuizStageLog` table. All the data in the column will be lost.
  - You are about to drop the column `timeSpent` on the `UserQuizStageLog` table. All the data in the column will be lost.
  - Made the column `jobId` on table `CampaignDomainQuizSet` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `category` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enabled` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionType` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `specificFeature` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `UserQuizQuestionLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `domainId` to the `UserQuizQuestionLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `elapsedSeconds` to the `UserQuizQuestionLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enabled` to the `UserQuizQuestionLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product` to the `UserQuizQuestionLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionType` to the `UserQuizQuestionLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `score` to the `UserQuizQuestionLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `specificFeature` to the `UserQuizQuestionLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stageIndex` to the `UserQuizQuestionLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `domainId` to the `UserQuizStageLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `elapsedSeconds` to the `UserQuizStageLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startedAt` to the `UserQuizStageLog` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'SINGLE_CHOICE', 'TRUE_FALSE');

-- AlterTable
ALTER TABLE "CampaignDomainQuizSet" ALTER COLUMN "jobId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "enabled" BOOLEAN NOT NULL,
ADD COLUMN     "product" TEXT NOT NULL,
ADD COLUMN     "questionType" "QuestionType" NOT NULL,
ADD COLUMN     "specificFeature" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserQuizQuestionLog" DROP COLUMN "countryId",
DROP COLUMN "timeSpent",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "domainId" TEXT NOT NULL,
ADD COLUMN     "elapsedSeconds" INTEGER NOT NULL,
ADD COLUMN     "enabled" BOOLEAN NOT NULL,
ADD COLUMN     "product" TEXT NOT NULL,
ADD COLUMN     "questionType" "QuestionType" NOT NULL,
ADD COLUMN     "score" INTEGER NOT NULL,
ADD COLUMN     "specificFeature" TEXT NOT NULL,
ADD COLUMN     "stageIndex" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UserQuizStageLog" DROP COLUMN "countryId",
DROP COLUMN "timeSpent",
ADD COLUMN     "domainId" TEXT NOT NULL,
ADD COLUMN     "elapsedSeconds" INTEGER NOT NULL,
ADD COLUMN     "endedAt" TIMESTAMP(3),
ADD COLUMN     "startedAt" TIMESTAMP(3) NOT NULL;
