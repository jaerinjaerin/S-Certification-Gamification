/*
  Warnings:

  - You are about to drop the column `language` on the `QuestionOptionTranslation` table. All the data in the column will be lost.
  - Added the required column `userJobName` to the `CountryUserJobQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `languageCode` to the `QuestionOptionTranslation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CountryUserJobQuestion" ADD COLUMN     "userJobName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "QuestionOptionTranslation" DROP COLUMN "language",
ADD COLUMN     "languageCode" TEXT NOT NULL;
