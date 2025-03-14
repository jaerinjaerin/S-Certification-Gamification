-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "domainId" TEXT;

-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "campaignId" TEXT,
ADD COLUMN     "domainId" TEXT;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "campaignId" TEXT,
ADD COLUMN     "domainId" TEXT;

-- AlterTable
ALTER TABLE "QuizBadge" ADD COLUMN     "campaignId" TEXT,
ADD COLUMN     "domainId" TEXT;

-- AlterTable
ALTER TABLE "QuizStage" ADD COLUMN     "campaignId" TEXT,
ADD COLUMN     "domainId" TEXT;
