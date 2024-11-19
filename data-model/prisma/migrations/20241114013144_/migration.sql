/*
  Warnings:

  - You are about to drop the column `lives` on the `QuizSet` table. All the data in the column will be lost.
  - You are about to drop the column `metadataId` on the `QuizSet` table. All the data in the column will be lost.
  - You are about to drop the column `nextStage` on the `QuizSet` table. All the data in the column will be lost.
  - You are about to drop the column `stage` on the `QuizSet` table. All the data in the column will be lost.
  - You are about to drop the column `timeLimitSeconds` on the `QuizSet` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `QuizSet` table. All the data in the column will be lost.
  - You are about to drop the `QuizCampaign` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuizMetadata` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuizOption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuizQuestion` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `defaultLanguage` to the `QuizSet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `QuizSet` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "QuizOption" DROP CONSTRAINT "QuizOption_questionId_fkey";

-- DropForeignKey
ALTER TABLE "QuizQuestion" DROP CONSTRAINT "QuizQuestion_quizSetId_fkey";

-- DropForeignKey
ALTER TABLE "QuizSet" DROP CONSTRAINT "QuizSet_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "QuizSet" DROP CONSTRAINT "QuizSet_metadataId_fkey";

-- DropForeignKey
ALTER TABLE "UserQuestionAttempt" DROP CONSTRAINT "UserQuestionAttempt_questionId_fkey";

-- AlterTable
ALTER TABLE "QuizSet" DROP COLUMN "lives",
DROP COLUMN "metadataId",
DROP COLUMN "nextStage",
DROP COLUMN "stage",
DROP COLUMN "timeLimitSeconds",
DROP COLUMN "title",
ADD COLUMN     "defaultLanguage" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "job" TEXT;

-- DropTable
DROP TABLE "QuizCampaign";

-- DropTable
DROP TABLE "QuizMetadata";

-- DropTable
DROP TABLE "QuizOption";

-- DropTable
DROP TABLE "QuizQuestion";

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizSetTranslation" (
    "id" TEXT NOT NULL,
    "quizSetId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "QuizSetTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stage" (
    "id" TEXT NOT NULL,
    "quizSetId" TEXT NOT NULL,
    "stageNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "defaultLanguage" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionTranslation" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,

    CONSTRAINT "QuestionTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Option" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "optionText" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OptionTranslation" (
    "id" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "optionText" TEXT NOT NULL,

    CONSTRAINT "OptionTranslation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuizSet" ADD CONSTRAINT "QuizSet_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSetTranslation" ADD CONSTRAINT "QuizSetTranslation_quizSetId_fkey" FOREIGN KEY ("quizSetId") REFERENCES "QuizSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_quizSetId_fkey" FOREIGN KEY ("quizSetId") REFERENCES "QuizSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionTranslation" ADD CONSTRAINT "QuestionTranslation_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptionTranslation" ADD CONSTRAINT "OptionTranslation_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "Option"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuestionAttempt" ADD CONSTRAINT "UserQuestionAttempt_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
