/*
  Warnings:

  - The primary key for the `ChannelSegment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Domain` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SalesFormat` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "CampaignDomainQuizSet" DROP CONSTRAINT "CampaignDomainQuizSet_domainId_fkey";

-- DropForeignKey
ALTER TABLE "SalesFormat" DROP CONSTRAINT "SalesFormat_channelSegmentId_fkey";

-- AlterTable
ALTER TABLE "CampaignDomainQuizSet" ALTER COLUMN "domainId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "ChannelSegment" DROP CONSTRAINT "ChannelSegment_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ChannelSegment_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ChannelSegment_id_seq";

-- AlterTable
ALTER TABLE "Domain" DROP CONSTRAINT "Domain_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Domain_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "SalesFormat" DROP CONSTRAINT "SalesFormat_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "channelSegmentId" SET DATA TYPE TEXT,
ADD CONSTRAINT "SalesFormat_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "SalesFormat_id_seq";

-- AlterTable
ALTER TABLE "UserCampaignDomainLog" ALTER COLUMN "domainId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "domainId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "CampaignDomainQuizSet" ADD CONSTRAINT "CampaignDomainQuizSet_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesFormat" ADD CONSTRAINT "SalesFormat_channelSegmentId_fkey" FOREIGN KEY ("channelSegmentId") REFERENCES "ChannelSegment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
