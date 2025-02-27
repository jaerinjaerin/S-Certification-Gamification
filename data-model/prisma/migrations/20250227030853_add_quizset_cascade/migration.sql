-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_quizStageId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionOption" DROP CONSTRAINT "QuestionOption_questionId_fkey";

-- DropForeignKey
ALTER TABLE "QuizStage" DROP CONSTRAINT "QuizStage_quizSetId_fkey";

-- AddForeignKey
ALTER TABLE "QuizStage" ADD CONSTRAINT "QuizStage_quizSetId_fkey" FOREIGN KEY ("quizSetId") REFERENCES "QuizSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_quizStageId_fkey" FOREIGN KEY ("quizStageId") REFERENCES "QuizStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
