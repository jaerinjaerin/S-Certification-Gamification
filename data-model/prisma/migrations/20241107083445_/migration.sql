/*
  Warnings:

  - You are about to drop the column `quizSetId` on the `UserQuizHistory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,quizCampaignId,quizMetadataId]` on the table `UserQuizHistory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `quizCampaignId` to the `UserQuizHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quizMetadataId` to the `UserQuizHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "QuizOption" DROP CONSTRAINT "QuizOption_questionId_fkey";

-- DropForeignKey
ALTER TABLE "UserQuizHistory" DROP CONSTRAINT "UserQuizHistory_quizSetId_fkey";

-- DropIndex
DROP INDEX "UserQuizHistory_userId_quizSetId_key";

-- AlterTable
ALTER TABLE "QuizOption" ALTER COLUMN "questionId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserQuizHistory" DROP COLUMN "quizSetId",
ADD COLUMN     "quizCampaignId" TEXT NOT NULL,
ADD COLUMN     "quizMetadataId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserQuizHistory_userId_quizCampaignId_quizMetadataId_key" ON "UserQuizHistory"("userId", "quizCampaignId", "quizMetadataId");

-- AddForeignKey
ALTER TABLE "QuizOption" ADD CONSTRAINT "QuizOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
