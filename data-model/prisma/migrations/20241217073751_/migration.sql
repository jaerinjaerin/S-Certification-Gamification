/*
  Warnings:

  - You are about to drop the column `quizsetPath` on the `UserQuizLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserQuizLog" DROP COLUMN "quizsetPath",
ADD COLUMN     "quizSetPath" TEXT;
