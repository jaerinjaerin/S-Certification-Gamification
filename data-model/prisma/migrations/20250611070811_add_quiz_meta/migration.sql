/*
  Warnings:

  - You are about to drop the column `splusUserActive` on the `QuizSet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "QuizSet" DROP COLUMN "splusUserActive";

-- CreateTable
CREATE TABLE "QuizSetMeta" (
    "id" TEXT NOT NULL,
    "quizSetId" TEXT NOT NULL,
    "sPlusUserActive" BOOLEAN DEFAULT false,

    CONSTRAINT "QuizSetMeta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuizSetMeta_quizSetId_key" ON "QuizSetMeta"("quizSetId");

-- AddForeignKey
ALTER TABLE "QuizSetMeta" ADD CONSTRAINT "QuizSetMeta_quizSetId_fkey" FOREIGN KEY ("quizSetId") REFERENCES "QuizSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
