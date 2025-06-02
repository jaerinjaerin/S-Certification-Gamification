/*
  Warnings:

  - Added the required column `subsidiaryId` to the `DomainGoal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `importance` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DomainGoal" DROP CONSTRAINT "DomainGoal_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "DomainGoal" DROP CONSTRAINT "DomainGoal_domainId_fkey";

-- AlterTable
ALTER TABLE "DomainGoal" ADD COLUMN     "regionId" TEXT,
ADD COLUMN     "subsidiaryId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "importance" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserQuizQuestionLog" ADD COLUMN     "importance" TEXT,
ADD COLUMN     "questionText" TEXT,
ALTER COLUMN "specificFeature" DROP NOT NULL;
