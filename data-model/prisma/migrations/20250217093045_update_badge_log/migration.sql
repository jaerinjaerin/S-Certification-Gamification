/*
  Warnings:

  - You are about to drop the column `statusText` on the `BadgeLog` table. All the data in the column will be lost.
  - Added the required column `message` to the `BadgeLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BadgeLog" DROP COLUMN "statusText",
ADD COLUMN     "message" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "accountUserId" DROP NOT NULL,
ALTER COLUMN "accessToken" DROP NOT NULL,
ALTER COLUMN "rawLog" DROP NOT NULL;
