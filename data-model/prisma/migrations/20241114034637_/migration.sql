/*
  Warnings:

  - You are about to drop the column `metadataId` on the `UserQuizHistory` table. All the data in the column will be lost.
  - You are about to drop the column `job` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `CountryQuestion` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,campaignId]` on the table `UserQuizHistory` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "CountryQuestion" DROP CONSTRAINT "CountryQuestion_countryId_fkey";

-- DropForeignKey
ALTER TABLE "CountryQuestion" DROP CONSTRAINT "CountryQuestion_questionId_fkey";

-- DropIndex
DROP INDEX "UserQuizHistory_userId_campaignId_metadataId_key";

-- AlterTable
ALTER TABLE "UserQuizHistory" DROP COLUMN "metadataId";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "job",
ADD COLUMN     "userJobId" TEXT;

-- DropTable
DROP TABLE "CountryQuestion";

-- CreateTable
CREATE TABLE "UserJob" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "UserJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountryUserJobQuestion" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "UserJobId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CountryUserJobQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserQuizHistory_userId_campaignId_key" ON "UserQuizHistory"("userId", "campaignId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_userJobId_fkey" FOREIGN KEY ("userJobId") REFERENCES "UserJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryUserJobQuestion" ADD CONSTRAINT "CountryUserJobQuestion_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryUserJobQuestion" ADD CONSTRAINT "CountryUserJobQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
