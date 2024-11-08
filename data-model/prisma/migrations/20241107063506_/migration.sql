-- CreateTable
CREATE TABLE "UserQuizHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizSetId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL,
    "stage" INTEGER NOT NULL,
    "progress" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserQuizHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizCampaign" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "releaseDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizMetadata" (
    "id" TEXT NOT NULL,
    "serviceEntity" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,

    CONSTRAINT "QuizMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizSet" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "timeLimitSeconds" INTEGER NOT NULL,
    "lives" INTEGER NOT NULL,
    "stage" INTEGER NOT NULL,
    "nextStage" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadataId" TEXT NOT NULL,

    CONSTRAINT "QuizSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "correctOptionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "quizSetId" TEXT NOT NULL,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizOption" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "QuizOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserQuestionAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizSetId" TEXT NOT NULL,
    "stage" INTEGER NOT NULL,
    "questionId" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "selectedOptionId" TEXT NOT NULL,
    "selectedOptionText" TEXT NOT NULL,
    "attemptTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeTaken" INTEGER NOT NULL,
    "serviceEntity" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "campaignId" TEXT,
    "campaignTitle" TEXT,
    "campaignReleaseDate" TIMESTAMP(3),

    CONSTRAINT "UserQuestionAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserQuizHistory_userId_quizSetId_key" ON "UserQuizHistory"("userId", "quizSetId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizMetadata_campaignId_key" ON "QuizMetadata"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizSet_metadataId_key" ON "QuizSet"("metadataId");

-- CreateIndex
CREATE INDEX "UserQuestionAttempt_userId_quizSetId_stage_questionId_idx" ON "UserQuestionAttempt"("userId", "quizSetId", "stage", "questionId");

-- AddForeignKey
ALTER TABLE "UserQuizHistory" ADD CONSTRAINT "UserQuizHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuizHistory" ADD CONSTRAINT "UserQuizHistory_quizSetId_fkey" FOREIGN KEY ("quizSetId") REFERENCES "QuizSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizMetadata" ADD CONSTRAINT "QuizMetadata_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "QuizCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSet" ADD CONSTRAINT "QuizSet_metadataId_fkey" FOREIGN KEY ("metadataId") REFERENCES "QuizMetadata"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_quizSetId_fkey" FOREIGN KEY ("quizSetId") REFERENCES "QuizSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizOption" ADD CONSTRAINT "QuizOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuestionAttempt" ADD CONSTRAINT "UserQuestionAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuestionAttempt" ADD CONSTRAINT "UserQuestionAttempt_quizSetId_fkey" FOREIGN KEY ("quizSetId") REFERENCES "QuizSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuestionAttempt" ADD CONSTRAINT "UserQuestionAttempt_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
