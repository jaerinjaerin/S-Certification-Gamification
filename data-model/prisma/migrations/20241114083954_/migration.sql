/*
  Warnings:

  - You are about to drop the column `language` on the `QuestionTranslation` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `QuizSetTranslation` table. All the data in the column will be lost.
  - Added the required column `languageCode` to the `QuestionTranslation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `languageCode` to the `QuizSetTranslation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QuestionTranslation" DROP COLUMN "language",
ADD COLUMN     "languageCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "QuizSetTranslation" DROP COLUMN "language",
ADD COLUMN     "languageCode" TEXT NOT NULL;
