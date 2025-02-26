-- AlterTable
ALTER TABLE "Language" ADD COLUMN     "defaultDomainCode" TEXT,
ADD COLUMN     "defaultDomainId" TEXT;

-- CreateTable
CREATE TABLE "DomainWebLanguage" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DomainWebLanguage_pkey" PRIMARY KEY ("id")
);
