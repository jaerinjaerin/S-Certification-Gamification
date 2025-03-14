/*
  Warnings:

  - Made the column `authType` on table `UserQuizBadgeStageLog` required. This step will fail if there are existing NULL values in that column.
  - Made the column `authType` on table `UserQuizLog` required. This step will fail if there are existing NULL values in that column.
  - Made the column `authType` on table `UserQuizQuestionLog` required. This step will fail if there are existing NULL values in that column.
  - Made the column `authType` on table `UserQuizStageLog` required. This step will fail if there are existing NULL values in that column.
  - Made the column `authType` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "UserQuizBadgeStageLog" ALTER COLUMN "authType" SET NOT NULL;

-- AlterTable
ALTER TABLE "UserQuizLog" ALTER COLUMN "authType" SET NOT NULL;

-- AlterTable
ALTER TABLE "UserQuizQuestionLog" ALTER COLUMN "authType" SET NOT NULL;

-- AlterTable
ALTER TABLE "UserQuizStageLog" ALTER COLUMN "authType" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "authType" SET NOT NULL;
