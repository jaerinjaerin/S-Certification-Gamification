/*
  Warnings:

  - You are about to drop the column `jobIds` on the `QuizSet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "QuizSet" DROP COLUMN "jobIds",
ADD COLUMN     "jobCodes" TEXT[];
