-- AddForeignKey
ALTER TABLE "UserQuizQuestionLog" ADD CONSTRAINT "UserQuizQuestionLog_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
