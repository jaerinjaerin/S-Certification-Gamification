/*
  Warnings:

  - Added the required column `languageCode` to the `CountryLanguage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CountryLanguage" ADD COLUMN     "languageCode" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "CountryLanguage" ADD CONSTRAINT "CountryLanguage_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
