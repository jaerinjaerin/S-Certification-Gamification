/*
  Warnings:

  - You are about to drop the column `countryId` on the `CountryLanguage` table. All the data in the column will be lost.
  - Added the required column `countryCode` to the `CountryLanguage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CountryLanguage" DROP CONSTRAINT "CountryLanguage_countryId_fkey";

-- AlterTable
ALTER TABLE "CountryLanguage" DROP COLUMN "countryId",
ADD COLUMN     "countryCode" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "CountryLanguage" ADD CONSTRAINT "CountryLanguage_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
