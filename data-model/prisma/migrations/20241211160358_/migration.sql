/*
  Warnings:

  - You are about to drop the column `channelSegmentId` on the `SalesFormat` table. All the data in the column will be lost.
  - You are about to drop the column `jobId` on the `SalesFormat` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `Store` table. All the data in the column will be lost.
  - Added the required column `group` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SalesFormat" DROP CONSTRAINT "SalesFormat_channelSegmentId_fkey";

-- DropForeignKey
ALTER TABLE "SalesFormat" DROP CONSTRAINT "SalesFormat_jobId_fkey";

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "group" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SalesFormat" DROP COLUMN "channelSegmentId",
DROP COLUMN "jobId";

-- AlterTable
ALTER TABLE "Store" DROP COLUMN "code";
