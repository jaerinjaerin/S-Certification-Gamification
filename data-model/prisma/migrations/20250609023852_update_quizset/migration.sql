/*
  Warnings:

  - You are about to drop the column `active` on the `QuizSet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "QuizSet" DROP COLUMN "active",
ADD COLUMN     "splusUserActive" BOOLEAN DEFAULT false;
