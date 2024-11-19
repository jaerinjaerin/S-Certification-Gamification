/*
  Warnings:

  - You are about to drop the column `campaignDomainId` on the `CampaignDomainQuizSet` table. All the data in the column will be lost.
  - You are about to drop the column `campaignDomainId` on the `UserCampaignDomainLog` table. All the data in the column will be lost.
  - You are about to drop the `CampaignDomain` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `campaignId` to the `CampaignDomainQuizSet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `domainId` to the `CampaignDomainQuizSet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `campaignDomainQuizSetId` to the `UserCampaignDomainLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CampaignDomain" DROP CONSTRAINT "CampaignDomain_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "CampaignDomain" DROP CONSTRAINT "CampaignDomain_domainId_fkey";

-- DropForeignKey
ALTER TABLE "CampaignDomainQuizSet" DROP CONSTRAINT "CampaignDomainQuizSet_campaignDomainId_fkey";

-- AlterTable
ALTER TABLE "CampaignDomainQuizSet" DROP COLUMN "campaignDomainId",
ADD COLUMN     "activityId" TEXT,
ADD COLUMN     "campaignId" TEXT NOT NULL,
ADD COLUMN     "domainId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UserCampaignDomainLog" DROP COLUMN "campaignDomainId",
ADD COLUMN     "campaignDomainQuizSetId" TEXT NOT NULL;

-- DropTable
DROP TABLE "CampaignDomain";

-- AddForeignKey
ALTER TABLE "CampaignDomainQuizSet" ADD CONSTRAINT "CampaignDomainQuizSet_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignDomainQuizSet" ADD CONSTRAINT "CampaignDomainQuizSet_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCampaignDomainLog" ADD CONSTRAINT "UserCampaignDomainLog_campaignDomainQuizSetId_fkey" FOREIGN KEY ("campaignDomainQuizSetId") REFERENCES "CampaignDomainQuizSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
