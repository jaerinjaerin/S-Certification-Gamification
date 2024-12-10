/*
  Warnings:

  - You are about to drop the column `firstBadgeActivityId` on the `UserQuizLog` table. All the data in the column will be lost.
  - You are about to drop the column `firstBadgeStage` on the `UserQuizLog` table. All the data in the column will be lost.
  - You are about to drop the column `isFirstBadgeStageCompleted` on the `UserQuizLog` table. All the data in the column will be lost.
  - You are about to drop the column `lastBadgeActivityId` on the `UserQuizLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserQuizLog" DROP COLUMN "firstBadgeActivityId",
DROP COLUMN "firstBadgeStage",
DROP COLUMN "isFirstBadgeStageCompleted",
DROP COLUMN "lastBadgeActivityId",
ADD COLUMN     "badgeActivityIds" TEXT[],
ADD COLUMN     "badgeStages" INTEGER[];
