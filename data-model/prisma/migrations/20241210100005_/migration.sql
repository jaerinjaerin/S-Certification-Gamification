/*
  Warnings:

  - Added the required column `quizStageId` to the `UserQuizQuestionLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `remainingHearts` to the `UserQuizStageLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserQuizQuestionLog" ADD COLUMN     "correctOptionIds" TEXT[],
ADD COLUMN     "quizStageId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserQuizStageLog" ADD COLUMN     "remainingHearts" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "UserQuizQuestionLog" ADD CONSTRAINT "UserQuizQuestionLog_quizStageId_fkey" FOREIGN KEY ("quizStageId") REFERENCES "QuizStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
