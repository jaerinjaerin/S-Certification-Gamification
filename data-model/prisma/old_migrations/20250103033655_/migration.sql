-- CreateTable
CREATE TABLE "UserQuizStatistics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "authType" "AuthType" NOT NULL,
    "campaignId" TEXT NOT NULL,
    "isCompleted" BOOLEAN,
    "isBadgeAcquired" BOOLEAN,
    "lastCompletedStage" INTEGER,
    "elapsedSeconds" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "quizSetId" TEXT NOT NULL,
    "score" INTEGER,
    "quizSetPath" TEXT,
    "domainId" TEXT,
    "languageId" TEXT,
    "jobId" TEXT,
    "regionId" TEXT,
    "subsidiaryId" TEXT,
    "storeId" TEXT,
    "storeSegmentText" TEXT,
    "channelId" TEXT,
    "channelSegmentId" TEXT,
    "channelName" TEXT,

    CONSTRAINT "UserQuizStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserQuizBadgeStageStatistics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "authType" "AuthType" NOT NULL,
    "campaignId" TEXT NOT NULL,
    "isBadgeAcquired" BOOLEAN,
    "badgeActivityId" TEXT,
    "elapsedSeconds" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "quizSetId" TEXT NOT NULL,
    "quizStageId" TEXT NOT NULL,
    "quizStageIndex" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "domainId" TEXT,
    "languageId" TEXT,
    "jobId" TEXT,
    "regionId" TEXT,
    "subsidiaryId" TEXT,
    "storeId" TEXT,
    "storeSegmentText" TEXT,
    "channelId" TEXT,
    "channelSegmentId" TEXT,
    "channelName" TEXT,

    CONSTRAINT "UserQuizBadgeStageStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserQuizStageStatistics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "authType" "AuthType" NOT NULL,
    "campaignId" TEXT NOT NULL,
    "quizStageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isBadgeStage" BOOLEAN,
    "isBadgeAcquired" BOOLEAN,
    "badgeActivityId" TEXT,
    "remainingHearts" INTEGER NOT NULL,
    "quizSetId" TEXT NOT NULL,
    "quizStageIndex" INTEGER NOT NULL,
    "elapsedSeconds" INTEGER NOT NULL,
    "score" INTEGER,
    "percentile" INTEGER,
    "scoreRange" TEXT,
    "domainId" TEXT NOT NULL,
    "languageId" TEXT,
    "jobId" TEXT NOT NULL,
    "regionId" TEXT,
    "subsidiaryId" TEXT,
    "storeId" TEXT,
    "storeSegmentText" TEXT,
    "channelId" TEXT,
    "channelSegmentId" TEXT,
    "channelName" TEXT,

    CONSTRAINT "UserQuizStageStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserQuizQuestionStatistics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "authType" "AuthType" NOT NULL,
    "quizSetId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "questionText" TEXT,
    "isCorrect" BOOLEAN NOT NULL,
    "selectedOptionIds" TEXT[],
    "correctOptionIds" TEXT[],
    "quizStageId" TEXT NOT NULL,
    "quizStageIndex" INTEGER NOT NULL,
    "elapsedSeconds" INTEGER NOT NULL,
    "questionType" "QuestionType" NOT NULL,
    "category" TEXT,
    "product" TEXT,
    "specificFeature" TEXT,
    "importance" TEXT,
    "campaignId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "languageId" TEXT,
    "domainId" TEXT,
    "regionId" TEXT,
    "subsidiaryId" TEXT,
    "storeId" TEXT,
    "storeSegmentText" TEXT,
    "channelId" TEXT,
    "channelSegmentId" TEXT,
    "channelName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserQuizQuestionStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserQuizStatistics_userId_campaignId_key" ON "UserQuizStatistics"("userId", "campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "UserQuizBadgeStageStatistics_userId_campaignId_quizStageId_key" ON "UserQuizBadgeStageStatistics"("userId", "campaignId", "quizStageId");
