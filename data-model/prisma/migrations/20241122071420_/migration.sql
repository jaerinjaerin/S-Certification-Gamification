/*
  Warnings:

  - Added the required column `channelSegmentIds` to the `Domain` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `verification_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Domain" ADD COLUMN     "channelSegmentIds" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "verification_tokens" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "ChannelSegment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ChannelSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesFormat" (
    "id" SERIAL NOT NULL,
    "channelSegmentId" INTEGER NOT NULL,
    "storeType" TEXT NOT NULL,
    "jobCode" TEXT NOT NULL,

    CONSTRAINT "SalesFormat_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SalesFormat" ADD CONSTRAINT "SalesFormat_channelSegmentId_fkey" FOREIGN KEY ("channelSegmentId") REFERENCES "ChannelSegment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
