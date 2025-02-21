/*
  Warnings:

  - You are about to drop the column `jobCodes` on the `ActivityBadge` table. All the data in the column will be lost.
  - Added the required column `badgeType` to the `ActivityBadge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobCode` to the `ActivityBadge` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BadgeType" AS ENUM ('FIRST', 'SECOND');

-- AlterTable
ALTER TABLE "ActivityBadge" DROP COLUMN "jobCodes",
ADD COLUMN     "badgeType" "BadgeType" NOT NULL,
ADD COLUMN     "jobCode" TEXT NOT NULL;
