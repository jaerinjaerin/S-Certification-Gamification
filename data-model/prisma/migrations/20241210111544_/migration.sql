/*
  Warnings:

  - You are about to drop the column `salesFormatId` on the `UserQuizLog` table. All the data in the column will be lost.
  - You are about to drop the column `subsidiaryId` on the `UserQuizLog` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `UserQuizQuestionLog` table. All the data in the column will be lost.
  - You are about to drop the column `salesFormatId` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserQuizLog" DROP COLUMN "salesFormatId",
DROP COLUMN "subsidiaryId",
ADD COLUMN     "channelId" TEXT,
ADD COLUMN     "storeId" TEXT,
ADD COLUMN     "subsidaryId" TEXT;

-- AlterTable
ALTER TABLE "UserQuizQuestionLog" DROP COLUMN "score",
ADD COLUMN     "channelId" TEXT,
ADD COLUMN     "channelSegmentId" TEXT,
ADD COLUMN     "regionId" TEXT,
ADD COLUMN     "storeId" TEXT,
ADD COLUMN     "subsidaryId" TEXT;

-- AlterTable
ALTER TABLE "UserQuizStageLog" ADD COLUMN     "badgeActivityId" TEXT,
ADD COLUMN     "channelId" TEXT,
ADD COLUMN     "channelSegmentId" TEXT,
ADD COLUMN     "isBadgeAcquired" BOOLEAN,
ADD COLUMN     "regionId" TEXT,
ADD COLUMN     "storeId" TEXT,
ADD COLUMN     "subsidaryId" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "salesFormatId",
ADD COLUMN     "channelId" TEXT,
ADD COLUMN     "regionId" TEXT,
ADD COLUMN     "storeId" TEXT,
ADD COLUMN     "subsidaryId" TEXT;
