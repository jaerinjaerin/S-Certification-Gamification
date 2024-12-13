/*
  Warnings:

  - You are about to drop the column `badgeAcquisitionDate` on the `UserQuizLog` table. All the data in the column will be lost.
  - You are about to drop the column `enabled` on the `UserQuizQuestionLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserQuizLog" DROP COLUMN "badgeAcquisitionDate",
ADD COLUMN     "badgeAcquisitionDates" TIMESTAMP(3)[],
ADD COLUMN     "channelSegmentId" TEXT,
ADD COLUMN     "regionId" TEXT,
ADD COLUMN     "salesFormatId" TEXT,
ADD COLUMN     "subsidiaryId" TEXT;

-- AlterTable
ALTER TABLE "UserQuizQuestionLog" DROP COLUMN "enabled";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "channel" TEXT;
