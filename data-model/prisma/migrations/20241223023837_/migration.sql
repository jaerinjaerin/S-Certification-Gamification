/*
  Warnings:

  - You are about to drop the `CampaignDomainGoal` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CampaignDomainGoal" DROP CONSTRAINT "CampaignDomainGoal_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "CampaignDomainGoal" DROP CONSTRAINT "CampaignDomainGoal_domainId_fkey";

-- DropTable
DROP TABLE "CampaignDomainGoal";

-- CreateTable
CREATE TABLE "DomainGoal" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "userCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DomainGoal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DomainGoal" ADD CONSTRAINT "DomainGoal_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomainGoal" ADD CONSTRAINT "DomainGoal_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
