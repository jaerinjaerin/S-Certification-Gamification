-- AlterTable
ALTER TABLE "QuestionOption" ADD COLUMN     "domainId" TEXT;

-- AlterTable
ALTER TABLE "QuizSet" ADD COLUMN     "languageId" TEXT;

-- AlterTable
ALTER TABLE "QuizStage" ADD COLUMN     "languageId" TEXT;

-- AlterTable
ALTER TABLE "UserQuizQuestionLog" ADD COLUMN     "originalIndex" INTEGER,
ADD COLUMN     "originalQuestionId" TEXT;

-- AlterTable
ALTER TABLE "UserQuizQuestionStatistics" ADD COLUMN     "originalIndex" INTEGER,
ADD COLUMN     "originalQuestionId" TEXT;
