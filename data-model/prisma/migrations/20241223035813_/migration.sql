/*
  Warnings:

  - You are about to drop the column `stageIndex` on the `UserQuizQuestionLog` table. All the data in the column will be lost.
  - You are about to drop the column `stageIndex` on the `UserQuizStageLog` table. All the data in the column will be lost.
  - Added the required column `quizStageIndex` to the `UserQuizQuestionLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quizStageIndex` to the `UserQuizStageLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserQuizQuestionLog" DROP COLUMN "stageIndex",
ADD COLUMN     "quizStageIndex" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UserQuizStageLog" DROP COLUMN "stageIndex",
ADD COLUMN     "quizStageIndex" INTEGER NOT NULL;
