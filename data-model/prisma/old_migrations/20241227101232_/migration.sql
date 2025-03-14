-- AlterTable
ALTER TABLE "UserQuizBadgeStageLog" ALTER COLUMN "authType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserQuizLog" ALTER COLUMN "authType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserQuizQuestionLog" ALTER COLUMN "authType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserQuizStageLog" ALTER COLUMN "authType" DROP NOT NULL;
