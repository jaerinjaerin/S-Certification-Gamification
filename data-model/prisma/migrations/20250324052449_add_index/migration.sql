-- CreateIndex
CREATE INDEX "UserQuizQuestionLog_userId_quizSetId_quizStageIndex_idx" ON "UserQuizQuestionLog"("userId", "quizSetId", "quizStageIndex");

-- CreateIndex
CREATE INDEX "UserQuizStageLog_userId_quizSetId_idx" ON "UserQuizStageLog"("userId", "quizSetId");
