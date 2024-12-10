/*
  Warnings:

  - Added the required column `jobId` to the `UserQuizStageLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserQuizStageLog" ADD COLUMN     "jobId" TEXT NOT NULL;
