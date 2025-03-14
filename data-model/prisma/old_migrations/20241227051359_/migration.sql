-- AlterTable
ALTER TABLE "UserQuizBadgeStageLog" ADD COLUMN     "storeSegmentText" TEXT;

-- AlterTable
ALTER TABLE "UserQuizLog" ADD COLUMN     "storeSegmentText" TEXT;

-- AlterTable
ALTER TABLE "UserQuizQuestionLog" ADD COLUMN     "storeSegmentText" TEXT;

-- AlterTable
ALTER TABLE "UserQuizStageLog" ADD COLUMN     "storeSegmentText" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "storeSegmentText" TEXT;

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);
