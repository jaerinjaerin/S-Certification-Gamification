/*
  Warnings:

  - You are about to drop the column `stageId` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `stageId` on the `UserQuizStageLog` table. All the data in the column will be lost.
  - You are about to drop the `QuizSet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuizSetTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Stage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserQuizSetLog` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `quizStageId` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `activityId` to the `UserQuizQuestionLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `campaignActivityId` to the `UserQuizQuestionLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `countryCode` to the `UserQuizQuestionLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `languageCode` to the `UserQuizQuestionLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `activityId` to the `UserQuizStageLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `campaignActivityId` to the `UserQuizStageLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `countryCode` to the `UserQuizStageLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `languageCode` to the `UserQuizStageLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quizStageId` to the `UserQuizStageLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_stageId_fkey";

-- DropForeignKey
ALTER TABLE "QuizSet" DROP CONSTRAINT "QuizSet_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "QuizSetTranslation" DROP CONSTRAINT "QuizSetTranslation_quizSetId_fkey";

-- DropForeignKey
ALTER TABLE "Stage" DROP CONSTRAINT "Stage_quizSetId_fkey";

-- DropForeignKey
ALTER TABLE "UserQuizStageLog" DROP CONSTRAINT "UserQuizStageLog_stageId_fkey";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "stageId",
ADD COLUMN     "quizStageId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserQuizQuestionLog" ADD COLUMN     "activityId" TEXT NOT NULL,
ADD COLUMN     "campaignActivityId" TEXT NOT NULL,
ADD COLUMN     "countryCode" TEXT NOT NULL,
ADD COLUMN     "languageCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserQuizStageLog" DROP COLUMN "stageId",
ADD COLUMN     "activityId" TEXT NOT NULL,
ADD COLUMN     "campaignActivityId" TEXT NOT NULL,
ADD COLUMN     "countryCode" TEXT NOT NULL,
ADD COLUMN     "languageCode" TEXT NOT NULL,
ADD COLUMN     "quizStageId" TEXT NOT NULL;

-- DropTable
DROP TABLE "QuizSet";

-- DropTable
DROP TABLE "QuizSetTranslation";

-- DropTable
DROP TABLE "Stage";

-- DropTable
DROP TABLE "UserQuizSetLog";

-- CreateTable
CREATE TABLE "QuizStage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "campaignId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCampaignActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignActivityId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL,
    "lastCompletedStage" INTEGER NOT NULL,
    "timeSpent" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "countryCode" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,

    CONSTRAINT "UserCampaignActivityLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuizStage" ADD CONSTRAINT "QuizStage_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_quizStageId_fkey" FOREIGN KEY ("quizStageId") REFERENCES "QuizStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCampaignActivityLog" ADD CONSTRAINT "UserCampaignActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCampaignActivityLog" ADD CONSTRAINT "UserCampaignActivityLog_campaignActivityId_fkey" FOREIGN KEY ("campaignActivityId") REFERENCES "CampaignActivity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuizStageLog" ADD CONSTRAINT "UserQuizStageLog_quizStageId_fkey" FOREIGN KEY ("quizStageId") REFERENCES "QuizStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
