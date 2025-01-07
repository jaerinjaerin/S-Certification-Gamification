-- CreateEnum
CREATE TYPE "AuthType" AS ENUM ('SUMTOTAL', 'GUEST');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTI_CHOICE', 'SINGLE_CHOICE', 'TRUE_FALSE');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emailId" TEXT,
    "authType" "AuthType",
    "providerUserId" TEXT,
    "providerPersonId" INTEGER,
    "jobId" TEXT,
    "sumtotalDomainId" TEXT,
    "sumtotalDomainCode" TEXT,
    "sumtotalJobId" TEXT,
    "sumtotalLanguageId" TEXT,
    "domainId" TEXT,
    "languageId" TEXT,
    "regionId" TEXT,
    "subsidiaryId" TEXT,
    "channelSegmentId" TEXT,
    "storeId" TEXT,
    "channelId" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserEmail" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "UserEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationRequest" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "VerifyToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerifyToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Language" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3) NOT NULL,
    "createrId" TEXT NOT NULL,
    "updaterId" TEXT,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hq" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "Hq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "hqId" TEXT,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subsidiary" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "regionId" TEXT,

    CONSTRAINT "Subsidiary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "subsidiaryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DomainGoal" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "userCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DomainGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizSet" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "domainId" TEXT,
    "subsidiaryId" TEXT,
    "jobCodes" TEXT[],
    "createrId" TEXT NOT NULL,
    "updaterId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizStage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "questionIds" TEXT[],
    "lifeCount" INTEGER NOT NULL,
    "quizSetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isBadgeStage" BOOLEAN,
    "badgeActivityId" TEXT,
    "badgeImageUrl" TEXT,
    "backgroundImageUrl" TEXT,
    "characterImageUrl" TEXT,

    CONSTRAINT "QuizStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "timeLimitSeconds" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "languageId" TEXT NOT NULL,
    "originalQuestionId" TEXT NOT NULL,
    "originalIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "backgroundImageUrl" TEXT,
    "characterImageUrl" TEXT,
    "category" TEXT NOT NULL,
    "specificFeature" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "product" TEXT NOT NULL,
    "questionType" "QuestionType" NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionOption" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "questionId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelSegment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ChannelSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserQuizLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
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
    "channelSegmentId" TEXT,
    "storeId" TEXT,
    "channelId" TEXT,

    CONSTRAINT "UserQuizLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserQuizBadgeStageLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
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
    "channelSegmentId" TEXT,
    "storeId" TEXT,
    "channelId" TEXT,

    CONSTRAINT "UserQuizBadgeStageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserQuizStageLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
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
    "domainId" TEXT NOT NULL,
    "languageId" TEXT,
    "jobId" TEXT NOT NULL,
    "regionId" TEXT,
    "subsidiaryId" TEXT,
    "channelSegmentId" TEXT,
    "storeId" TEXT,
    "channelId" TEXT,

    CONSTRAINT "UserQuizStageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserQuizQuestionLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizSetId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "selectedOptionIds" TEXT[],
    "correctOptionIds" TEXT[],
    "quizStageId" TEXT NOT NULL,
    "quizStageIndex" INTEGER NOT NULL,
    "elapsedSeconds" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "specificFeature" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "questionType" "QuestionType" NOT NULL,
    "campaignId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "languageId" TEXT,
    "domainId" TEXT,
    "regionId" TEXT,
    "subsidiaryId" TEXT,
    "channelSegmentId" TEXT,
    "storeId" TEXT,
    "channelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserQuizQuestionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationRequest_token_key" ON "VerificationRequest"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationRequest_identifier_token_key" ON "VerificationRequest"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "VerifyToken_email_idx" ON "VerifyToken"("email");

-- CreateIndex
CREATE INDEX "VerifyToken_token_idx" ON "VerifyToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Language_code_key" ON "Language"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Hq_code_key" ON "Hq"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Region_code_key" ON "Region"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Subsidiary_code_key" ON "Subsidiary"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_code_key" ON "Domain"("code");

-- CreateIndex
CREATE UNIQUE INDEX "UserQuizLog_userId_campaignId_key" ON "UserQuizLog"("userId", "campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "UserQuizBadgeStageLog_userId_campaignId_quizStageId_key" ON "UserQuizBadgeStageLog"("userId", "campaignId", "quizStageId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Region" ADD CONSTRAINT "Region_hqId_fkey" FOREIGN KEY ("hqId") REFERENCES "Hq"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subsidiary" ADD CONSTRAINT "Subsidiary_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Domain" ADD CONSTRAINT "Domain_subsidiaryId_fkey" FOREIGN KEY ("subsidiaryId") REFERENCES "Subsidiary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomainGoal" ADD CONSTRAINT "DomainGoal_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomainGoal" ADD CONSTRAINT "DomainGoal_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSet" ADD CONSTRAINT "QuizSet_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSet" ADD CONSTRAINT "QuizSet_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSet" ADD CONSTRAINT "QuizSet_subsidiaryId_fkey" FOREIGN KEY ("subsidiaryId") REFERENCES "Subsidiary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizStage" ADD CONSTRAINT "QuizStage_quizSetId_fkey" FOREIGN KEY ("quizSetId") REFERENCES "QuizSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuizLog" ADD CONSTRAINT "UserQuizLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuizLog" ADD CONSTRAINT "UserQuizLog_quizSetId_fkey" FOREIGN KEY ("quizSetId") REFERENCES "QuizSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
