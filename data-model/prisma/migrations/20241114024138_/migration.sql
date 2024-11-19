/*
  Warnings:

  - The primary key for the `Campaign` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Country` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CountryLanguage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CountryQuestion` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Language` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Question` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `QuestionOption` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `QuestionOptionTranslation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `QuestionTranslation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `QuizSet` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `QuizSetTranslation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Stage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserQuizQuestionLog` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserQuizSetLog` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserQuizStageLog` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "CountryLanguage" DROP CONSTRAINT "CountryLanguage_countryId_fkey";

-- DropForeignKey
ALTER TABLE "CountryQuestion" DROP CONSTRAINT "CountryQuestion_countryId_fkey";

-- DropForeignKey
ALTER TABLE "CountryQuestion" DROP CONSTRAINT "CountryQuestion_questionId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_stageId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionOption" DROP CONSTRAINT "QuestionOption_questionId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionOptionTranslation" DROP CONSTRAINT "QuestionOptionTranslation_optionId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionTranslation" DROP CONSTRAINT "QuestionTranslation_questionId_fkey";

-- DropForeignKey
ALTER TABLE "QuizSet" DROP CONSTRAINT "QuizSet_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "QuizSetTranslation" DROP CONSTRAINT "QuizSetTranslation_quizSetId_fkey";

-- DropForeignKey
ALTER TABLE "Stage" DROP CONSTRAINT "Stage_quizSetId_fkey";

-- DropForeignKey
ALTER TABLE "UserQuizQuestionLog" DROP CONSTRAINT "UserQuizQuestionLog_questionId_fkey";

-- DropForeignKey
ALTER TABLE "UserQuizStageLog" DROP CONSTRAINT "UserQuizStageLog_stageId_fkey";

-- AlterTable
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Campaign_id_seq";

-- AlterTable
ALTER TABLE "Country" DROP CONSTRAINT "Country_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Country_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Country_id_seq";

-- AlterTable
ALTER TABLE "CountryLanguage" DROP CONSTRAINT "CountryLanguage_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "countryId" SET DATA TYPE TEXT,
ADD CONSTRAINT "CountryLanguage_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CountryLanguage_id_seq";

-- AlterTable
ALTER TABLE "CountryQuestion" DROP CONSTRAINT "CountryQuestion_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "countryId" SET DATA TYPE TEXT,
ALTER COLUMN "questionId" SET DATA TYPE TEXT,
ADD CONSTRAINT "CountryQuestion_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CountryQuestion_id_seq";

-- AlterTable
ALTER TABLE "Language" DROP CONSTRAINT "Language_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Language_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Language_id_seq";

-- AlterTable
ALTER TABLE "Question" DROP CONSTRAINT "Question_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "stageId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Question_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Question_id_seq";

-- AlterTable
ALTER TABLE "QuestionOption" DROP CONSTRAINT "QuestionOption_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "questionId" SET DATA TYPE TEXT,
ADD CONSTRAINT "QuestionOption_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "QuestionOption_id_seq";

-- AlterTable
ALTER TABLE "QuestionOptionTranslation" DROP CONSTRAINT "QuestionOptionTranslation_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "optionId" SET DATA TYPE TEXT,
ADD CONSTRAINT "QuestionOptionTranslation_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "QuestionOptionTranslation_id_seq";

-- AlterTable
ALTER TABLE "QuestionTranslation" DROP CONSTRAINT "QuestionTranslation_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "questionId" SET DATA TYPE TEXT,
ADD CONSTRAINT "QuestionTranslation_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "QuestionTranslation_id_seq";

-- AlterTable
ALTER TABLE "QuizSet" DROP CONSTRAINT "QuizSet_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "campaignId" SET DATA TYPE TEXT,
ADD CONSTRAINT "QuizSet_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "QuizSet_id_seq";

-- AlterTable
ALTER TABLE "QuizSetTranslation" DROP CONSTRAINT "QuizSetTranslation_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "quizSetId" SET DATA TYPE TEXT,
ADD CONSTRAINT "QuizSetTranslation_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "QuizSetTranslation_id_seq";

-- AlterTable
ALTER TABLE "Stage" DROP CONSTRAINT "Stage_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "quizSetId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Stage_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Stage_id_seq";

-- AlterTable
ALTER TABLE "UserQuizQuestionLog" DROP CONSTRAINT "UserQuizQuestionLog_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "questionId" SET DATA TYPE TEXT,
ADD CONSTRAINT "UserQuizQuestionLog_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "UserQuizQuestionLog_id_seq";

-- AlterTable
ALTER TABLE "UserQuizSetLog" DROP CONSTRAINT "UserQuizSetLog_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "UserQuizSetLog_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "UserQuizSetLog_id_seq";

-- AlterTable
ALTER TABLE "UserQuizStageLog" DROP CONSTRAINT "UserQuizStageLog_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "stageId" SET DATA TYPE TEXT,
ADD CONSTRAINT "UserQuizStageLog_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "UserQuizStageLog_id_seq";

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
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOptionTranslation" ADD CONSTRAINT "QuestionOptionTranslation_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "QuestionOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryLanguage" ADD CONSTRAINT "CountryLanguage_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryQuestion" ADD CONSTRAINT "CountryQuestion_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryQuestion" ADD CONSTRAINT "CountryQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuizQuestionLog" ADD CONSTRAINT "UserQuizQuestionLog_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuizStageLog" ADD CONSTRAINT "UserQuizStageLog_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
