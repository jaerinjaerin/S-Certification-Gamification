/*
  Warnings:

  - You are about to drop the column `languageIds` on the `QuizSet` table. All the data in the column will be lost.
  - The `badgeStages` column on the `QuizSet` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "QuizSet" DROP COLUMN "languageIds",
DROP COLUMN "badgeStages",
ADD COLUMN     "badgeStages" INTEGER[];
