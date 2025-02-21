/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Campaign` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[settingsId]` on the table `Campaign` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "BadgeApiType" AS ENUM ('REGISTER', 'PROGRESS');

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "settingsId" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL DEFAULT 's25';

-- AlterTable
ALTER TABLE "Domain" ADD COLUMN     "permissionId" TEXT;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "quizStageId" TEXT;

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

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "loginName" TEXT;

-- CreateTable
CREATE TABLE "CampaignSettings" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "totalStages" INTEGER,
    "firstBadgeName" TEXT,
    "secondBadgeName" TEXT,
    "ffFirstBadgeStageIndex" INTEGER,
    "ffSecondBadgeStageIndex" INTEGER,
    "fsmFirstBadgeStageIndex" INTEGER,
    "fsmSecondBadgeStageIndex" INTEGER,

    CONSTRAINT "CampaignSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizSetFile" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "quizSetId" TEXT NOT NULL,
    "jobCodes" TEXT[],
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizSetFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRoleMapping" (
    "id" TEXT NOT NULL,
    "loginName" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRoleMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityBadge" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "jobCodes" TEXT[],
    "domainId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "badgeImageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BadgeLog" (
    "id" TEXT NOT NULL,
    "apiType" "BadgeApiType" NOT NULL,
    "status" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "userId" TEXT,
    "accountUserId" TEXT,
    "activityId" TEXT NOT NULL,
    "accessToken" TEXT,
    "rawLog" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BadgeLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE INDEX "RolePermission_roleId_idx" ON "RolePermission"("roleId");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE INDEX "UserRole_userId_idx" ON "UserRole"("userId");

-- CreateIndex
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRoleMapping_loginName_key" ON "UserRoleMapping"("loginName");

-- CreateIndex
CREATE INDEX "UserRoleMapping_roleId_idx" ON "UserRoleMapping"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_slug_key" ON "Campaign"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_settingsId_key" ON "Campaign"("settingsId");

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "CampaignSettings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Domain" ADD CONSTRAINT "Domain_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSet" ADD CONSTRAINT "QuizSet_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSet" ADD CONSTRAINT "QuizSet_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_quizStageId_fkey" FOREIGN KEY ("quizStageId") REFERENCES "QuizStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoleMapping" ADD CONSTRAINT "UserRoleMapping_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityBadge" ADD CONSTRAINT "ActivityBadge_badgeImageId_fkey" FOREIGN KEY ("badgeImageId") REFERENCES "QuizBadge"("id") ON DELETE SET NULL ON UPDATE CASCADE;
