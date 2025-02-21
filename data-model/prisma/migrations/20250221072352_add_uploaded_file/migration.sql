-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('QUIZSET', 'ACTIVITYID', 'TARGET', 'UI_LANGUAGE', 'NON_SPLUS_DOMAINS');

-- CreateTable
CREATE TABLE "UploadedFile" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "originId" TEXT NOT NULL,
    "jobCode" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "fileType" "FileType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UploadedFile_pkey" PRIMARY KEY ("id")
);
