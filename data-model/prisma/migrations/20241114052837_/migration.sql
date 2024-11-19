/*
  Warnings:

  - You are about to drop the column `countryCode` on the `CountryLanguage` table. All the data in the column will be lost.
  - Added the required column `countryId` to the `CountryLanguage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CountryLanguage" DROP CONSTRAINT "CountryLanguage_countryCode_fkey";

-- AlterTable
ALTER TABLE "CountryLanguage" DROP COLUMN "countryCode",
ADD COLUMN     "countryId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "CountryLanguage" ADD CONSTRAINT "CountryLanguage_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
