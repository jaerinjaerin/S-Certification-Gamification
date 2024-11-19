/*
  Warnings:

  - You are about to drop the column `UserJobId` on the `CountryUserJobQuestion` table. All the data in the column will be lost.
  - Added the required column `userJobId` to the `CountryUserJobQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CountryUserJobQuestion" DROP COLUMN "UserJobId",
ADD COLUMN     "userJobId" TEXT NOT NULL;
