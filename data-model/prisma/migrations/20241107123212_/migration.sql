/*
  Warnings:

  - You are about to drop the column `campaignId` on the `QuizMetadata` table. All the data in the column will be lost.
  - Added the required column `campaignId` to the `QuizSet` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "QuizMetadata" DROP CONSTRAINT "QuizMetadata_campaignId_fkey";

-- AlterTable
ALTER TABLE "QuizMetadata" DROP COLUMN "campaignId",
ALTER COLUMN "serviceEntity" DROP NOT NULL;

-- AlterTable
ALTER TABLE "QuizSet" ADD COLUMN     "campaignId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "QuizSet" ADD CONSTRAINT "QuizSet_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "QuizCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
