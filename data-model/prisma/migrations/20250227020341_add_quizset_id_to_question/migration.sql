/*
  Warnings:

  - You are about to drop the column `defaultDomainCode` on the `Language` table. All the data in the column will be lost.
  - You are about to drop the column `defaultDomainId` on the `Language` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Language" DROP COLUMN "defaultDomainCode",
DROP COLUMN "defaultDomainId";

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "quizSetId" TEXT;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_quizSetId_fkey" FOREIGN KEY ("quizSetId") REFERENCES "QuizSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
