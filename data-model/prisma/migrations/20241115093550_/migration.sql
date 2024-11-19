/*
  Warnings:

  - The primary key for the `Domain` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `countryId` on the `UserCampaignDomainLog` table. All the data in the column will be lost.
  - You are about to drop the column `userJobId` on the `users` table. All the data in the column will be lost.
  - The `domainId` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `UserJob` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `domainId` on the `CampaignDomain` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Domain` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `domainId` to the `UserCampaignDomainLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CampaignDomain" DROP CONSTRAINT "CampaignDomain_domainId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_userJobId_fkey";

-- DropIndex
DROP INDEX "Domain_name_key";

-- AlterTable
ALTER TABLE "CampaignDomain" DROP COLUMN "domainId",
ADD COLUMN     "domainId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Domain" DROP CONSTRAINT "Domain_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ALTER COLUMN "name" DROP NOT NULL,
ADD CONSTRAINT "Domain_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserCampaignDomainLog" DROP COLUMN "countryId",
ADD COLUMN     "domainId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "userJobId",
ADD COLUMN     "jobId" TEXT,
DROP COLUMN "domainId",
ADD COLUMN     "domainId" INTEGER;

-- DropTable
DROP TABLE "UserJob";

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignDomain" ADD CONSTRAINT "CampaignDomain_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
