/*
  Warnings:

  - The primary key for the `Campaign` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `endDate` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Campaign` table. All the data in the column will be lost.
  - The `id` column on the `Campaign` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Question` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `defaultLanguage` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `questionText` on the `Question` table. All the data in the column will be lost.
  - The `id` column on the `Question` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `QuestionTranslation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `questionText` on the `QuestionTranslation` table. All the data in the column will be lost.
  - The `id` column on the `QuestionTranslation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `QuizSet` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `defaultLanguage` on the `QuizSet` table. All the data in the column will be lost.
  - The `id` column on the `QuizSet` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Stage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `description` on the `Stage` table. All the data in the column will be lost.
  - You are about to drop the column `stageNumber` on the `Stage` table. All the data in the column will be lost.
  - The `id` column on the `Stage` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Option` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OptionTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuizSetTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserQuestionAttempt` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `expiresIn` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lifeCount` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `stageId` on the `Question` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `text` to the `QuestionTranslation` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `questionId` on the `QuestionTranslation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `campaignId` on the `QuizSet` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `order` to the `Stage` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `quizSetId` on the `Stage` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Option" DROP CONSTRAINT "Option_questionId_fkey";

-- DropForeignKey
ALTER TABLE "OptionTranslation" DROP CONSTRAINT "OptionTranslation_optionId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_stageId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionTranslation" DROP CONSTRAINT "QuestionTranslation_questionId_fkey";

-- DropForeignKey
ALTER TABLE "QuizSet" DROP CONSTRAINT "QuizSet_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "QuizSetTranslation" DROP CONSTRAINT "QuizSetTranslation_quizSetId_fkey";

-- DropForeignKey
ALTER TABLE "Stage" DROP CONSTRAINT "Stage_quizSetId_fkey";

-- DropForeignKey
ALTER TABLE "UserQuestionAttempt" DROP CONSTRAINT "UserQuestionAttempt_questionId_fkey";

-- DropForeignKey
ALTER TABLE "UserQuestionAttempt" DROP CONSTRAINT "UserQuestionAttempt_quizSetId_fkey";

-- DropForeignKey
ALTER TABLE "UserQuestionAttempt" DROP CONSTRAINT "UserQuestionAttempt_userId_fkey";

-- AlterTable
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_pkey",
DROP COLUMN "endDate",
DROP COLUMN "startDate",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Question" DROP CONSTRAINT "Question_pkey",
DROP COLUMN "defaultLanguage",
DROP COLUMN "order",
DROP COLUMN "questionText",
ADD COLUMN     "expiresIn" INTEGER NOT NULL,
ADD COLUMN     "lifeCount" INTEGER NOT NULL,
ADD COLUMN     "text" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "stageId",
ADD COLUMN     "stageId" INTEGER NOT NULL,
ADD CONSTRAINT "Question_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "QuestionTranslation" DROP CONSTRAINT "QuestionTranslation_pkey",
DROP COLUMN "questionText",
ADD COLUMN     "text" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "questionId",
ADD COLUMN     "questionId" INTEGER NOT NULL,
ADD CONSTRAINT "QuestionTranslation_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "QuizSet" DROP CONSTRAINT "QuizSet_pkey",
DROP COLUMN "defaultLanguage",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "campaignId",
ADD COLUMN     "campaignId" INTEGER NOT NULL,
ADD CONSTRAINT "QuizSet_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Stage" DROP CONSTRAINT "Stage_pkey",
DROP COLUMN "description",
DROP COLUMN "stageNumber",
ADD COLUMN     "order" INTEGER NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "quizSetId",
ADD COLUMN     "quizSetId" INTEGER NOT NULL,
ADD CONSTRAINT "Stage_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "Option";

-- DropTable
DROP TABLE "OptionTranslation";

-- DropTable
DROP TABLE "QuizSetTranslation";

-- DropTable
DROP TABLE "UserQuestionAttempt";

-- CreateTable
CREATE TABLE "QuestionOption" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "QuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionOptionTranslation" (
    "id" SERIAL NOT NULL,
    "language" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "optionId" INTEGER NOT NULL,

    CONSTRAINT "QuestionOptionTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Language" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountryLanguage" (
    "id" SERIAL NOT NULL,
    "countryId" INTEGER NOT NULL,
    "languageId" INTEGER NOT NULL,

    CONSTRAINT "CountryLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountryQuestion" (
    "id" SERIAL NOT NULL,
    "countryId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CountryQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserQuizSetLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "campaignId" INTEGER NOT NULL,
    "countryCode" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "completedStages" INTEGER NOT NULL,
    "isFullyCompleted" BOOLEAN NOT NULL,
    "totalTimeSpent" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserQuizSetLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserQuizQuestionLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "timeSpent" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserQuizQuestionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserQuizStageLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "stageId" INTEGER NOT NULL,
    "isCompleted" BOOLEAN NOT NULL,
    "timeSpent" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserQuizStageLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Language_code_key" ON "Language"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- AddForeignKey
ALTER TABLE "QuizSet" ADD CONSTRAINT "QuizSet_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_quizSetId_fkey" FOREIGN KEY ("quizSetId") REFERENCES "QuizSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionTranslation" ADD CONSTRAINT "QuestionTranslation_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOptionTranslation" ADD CONSTRAINT "QuestionOptionTranslation_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "QuestionOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryLanguage" ADD CONSTRAINT "CountryLanguage_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryLanguage" ADD CONSTRAINT "CountryLanguage_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryQuestion" ADD CONSTRAINT "CountryQuestion_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryQuestion" ADD CONSTRAINT "CountryQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuizQuestionLog" ADD CONSTRAINT "UserQuizQuestionLog_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuizStageLog" ADD CONSTRAINT "UserQuizStageLog_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
