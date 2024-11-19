/*
  Warnings:

  - You are about to drop the column `questionIds` on the `CampaignDomainQuizSet` table. All the data in the column will be lost.
  - You are about to drop the column `campaignId` on the `QuizStage` table. All the data in the column will be lost.
  - Added the required column `order` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `campaignDomainQuizSetId` to the `QuizStage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionIds` to the `QuizStage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_quizStageId_fkey";

-- DropForeignKey
ALTER TABLE "QuizStage" DROP CONSTRAINT "QuizStage_campaignId_fkey";

-- AlterTable
ALTER TABLE "CampaignDomainQuizSet" DROP COLUMN "questionIds";

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "order" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "QuizStage" DROP COLUMN "campaignId",
ADD COLUMN     "campaignDomainQuizSetId" TEXT NOT NULL,
ADD COLUMN     "questionIds" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "QuizStage" ADD CONSTRAINT "QuizStage_campaignDomainQuizSetId_fkey" FOREIGN KEY ("campaignDomainQuizSetId") REFERENCES "CampaignDomainQuizSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
