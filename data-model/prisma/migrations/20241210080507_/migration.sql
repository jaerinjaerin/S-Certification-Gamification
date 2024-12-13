/*
  Warnings:

  - You are about to drop the column `endedAt` on the `UserQuizStageLog` table. All the data in the column will be lost.
  - You are about to drop the column `startedAt` on the `UserQuizStageLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserQuizStageLog" DROP COLUMN "endedAt",
DROP COLUMN "startedAt";
