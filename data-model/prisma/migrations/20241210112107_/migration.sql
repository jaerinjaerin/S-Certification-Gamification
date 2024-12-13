/*
  Warnings:

  - You are about to drop the column `badgeActivityIds` on the `QuizSet` table. All the data in the column will be lost.
  - You are about to drop the column `badgeStages` on the `QuizSet` table. All the data in the column will be lost.
  - You are about to drop the column `badgeAcquisitionDates` on the `UserQuizLog` table. All the data in the column will be lost.
  - You are about to drop the column `badgeActivityIds` on the `UserQuizLog` table. All the data in the column will be lost.
  - You are about to drop the column `badgeStages` on the `UserQuizLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "QuizSet" DROP COLUMN "badgeActivityIds",
DROP COLUMN "badgeStages";

-- AlterTable
ALTER TABLE "QuizStage" ADD COLUMN     "badgeActivityId" TEXT,
ADD COLUMN     "isBadgeStage" BOOLEAN;

-- AlterTable
ALTER TABLE "UserQuizLog" DROP COLUMN "badgeAcquisitionDates",
DROP COLUMN "badgeActivityIds",
DROP COLUMN "badgeStages";
