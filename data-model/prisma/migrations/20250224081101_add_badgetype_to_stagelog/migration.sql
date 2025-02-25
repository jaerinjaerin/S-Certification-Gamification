-- AlterTable
ALTER TABLE "QuizStage" ADD COLUMN     "badgeType" "BadgeType";

-- AlterTable
ALTER TABLE "UserQuizStageLog" ADD COLUMN     "badgeType" "BadgeType";

-- AlterTable
ALTER TABLE "UserQuizStageStatistics" ADD COLUMN     "badgeType" "BadgeType";
