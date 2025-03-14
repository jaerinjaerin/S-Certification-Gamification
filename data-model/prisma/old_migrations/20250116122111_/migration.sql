/*
  Warnings:

  - Added the required column `authType` to the `admin_users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "admin_users" ADD COLUMN     "authType" "AuthType" NOT NULL,
ADD COLUMN     "channelId" TEXT,
ADD COLUMN     "channelName" TEXT,
ADD COLUMN     "channelSegmentId" TEXT,
ADD COLUMN     "domainCode" TEXT,
ADD COLUMN     "domainId" TEXT,
ADD COLUMN     "emailId" TEXT,
ADD COLUMN     "jobId" TEXT,
ADD COLUMN     "languageId" TEXT,
ADD COLUMN     "providerPersonId" TEXT,
ADD COLUMN     "providerUserId" TEXT,
ADD COLUMN     "regionId" TEXT,
ADD COLUMN     "storeId" TEXT,
ADD COLUMN     "storeSegmentText" TEXT,
ADD COLUMN     "subsidiaryId" TEXT;
