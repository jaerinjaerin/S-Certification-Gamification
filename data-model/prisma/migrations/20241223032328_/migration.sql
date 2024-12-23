/*
  Warnings:

  - You are about to drop the column `timeSpent` on the `UserQuizBadgeStageLog` table. All the data in the column will be lost.
  - You are about to drop the column `timeSpent` on the `UserQuizLog` table. All the data in the column will be lost.
  - You are about to drop the column `isCompleted` on the `UserQuizStageLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserQuizBadgeStageLog" DROP COLUMN "timeSpent",
ADD COLUMN     "badgeActivityId" TEXT,
ADD COLUMN     "elapsedSeconds" INTEGER;

-- AlterTable
ALTER TABLE "UserQuizLog" DROP COLUMN "timeSpent",
ADD COLUMN     "elapsedSeconds" INTEGER;

-- AlterTable
ALTER TABLE "UserQuizStageLog" DROP COLUMN "isCompleted",
ADD COLUMN     "languageId" TEXT;
