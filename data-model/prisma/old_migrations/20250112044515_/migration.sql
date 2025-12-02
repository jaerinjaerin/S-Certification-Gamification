/*
  Warnings:

  - Added the required column `tryNumber` to the `UserQuizQuestionLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tryNumber` to the `UserQuizQuestionStatistics` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserQuizQuestionLog" ADD COLUMN     "tryNumber" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UserQuizQuestionStatistics" ADD COLUMN     "tryNumber" INTEGER NOT NULL;
