/*
  Warnings:

  - You are about to drop the column `channel` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "channel",
ADD COLUMN     "sumtotalChannelSegmentId" TEXT;
