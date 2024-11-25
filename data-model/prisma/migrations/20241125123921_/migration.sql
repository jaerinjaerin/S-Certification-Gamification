/*
  Warnings:

  - Added the required column `path` to the `CampaignDomainQuizSet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CampaignDomainQuizSet" ADD COLUMN     "path" TEXT NOT NULL;
