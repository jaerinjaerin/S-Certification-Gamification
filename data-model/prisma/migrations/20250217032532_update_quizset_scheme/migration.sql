-- CreateEnum
CREATE TYPE "BadgeType" AS ENUM ('EXPERT', 'ADVANCED');

-- CreateEnum
CREATE TYPE "BadgeApiType" AS ENUM ('REGISTER', 'PROGRESS');

-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_userId_fkey";

-- AlterTable
ALTER TABLE "Domain" ADD COLUMN     "permissionId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "loginName" TEXT;

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
    "userId" TEXT NOT NULL,
    "accountUserId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "statusText" TEXT NOT NULL,
    "rawLog" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BadgeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BadgeStage" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "badgeType" "BadgeType" NOT NULL,
    "quizStageIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BadgeStage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserRoleMapping_loginName_key" ON "UserRoleMapping"("loginName");

-- CreateIndex
CREATE INDEX "UserRoleMapping_roleId_idx" ON "UserRoleMapping"("roleId");

-- AddForeignKey
ALTER TABLE "Domain" ADD CONSTRAINT "Domain_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoleMapping" ADD CONSTRAINT "UserRoleMapping_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityBadge" ADD CONSTRAINT "ActivityBadge_badgeImageId_fkey" FOREIGN KEY ("badgeImageId") REFERENCES "QuizBadge"("id") ON DELETE SET NULL ON UPDATE CASCADE;
