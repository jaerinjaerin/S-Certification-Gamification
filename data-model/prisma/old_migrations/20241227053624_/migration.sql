/*
  Warnings:

  - You are about to drop the column `sumtotalDomainCode` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `sumtotalDomainId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `sumtotalJobId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `sumtotalLanguageId` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_languageId_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "sumtotalDomainCode",
DROP COLUMN "sumtotalDomainId",
DROP COLUMN "sumtotalJobId",
DROP COLUMN "sumtotalLanguageId",
ADD COLUMN     "domainCode" TEXT;
