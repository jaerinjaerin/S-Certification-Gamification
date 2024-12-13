/*
  Warnings:

  - The `questionIds` column on the `QuizStage` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `isFirstBadgeStage` on the `UserQuizStageLog` table. All the data in the column will be lost.
  - You are about to drop the column `profileId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `user_profiles` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `quizSetId` to the `QuizStage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quizSetId` to the `UserCampaignDomainLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobId` to the `UserQuizQuestionLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quizSetId` to the `UserQuizQuestionLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "user_profiles" DROP CONSTRAINT "user_profiles_userId_fkey";

-- DropIndex
DROP INDEX "UserEmail_email_key";

-- DropIndex
DROP INDEX "users_profileId_key";

-- AlterTable
ALTER TABLE "QuizStage" ADD COLUMN     "quizSetId" TEXT NOT NULL,
DROP COLUMN "questionIds",
ADD COLUMN     "questionIds" TEXT[];

-- AlterTable
ALTER TABLE "UserCampaignDomainLog" ADD COLUMN     "quizSetId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserQuizQuestionLog" ADD COLUMN     "jobId" TEXT NOT NULL,
ADD COLUMN     "quizSetId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserQuizStageLog" DROP COLUMN "isFirstBadgeStage",
ADD COLUMN     "isBadgeStage" BOOLEAN;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "profileId";

-- DropTable
DROP TABLE "user_profiles";

-- CreateTable
CREATE TABLE "QuizSet" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "jobIds" TEXT[],
    "languageIds" TEXT[],
    "badgeStages" TEXT[],
    "badgeActivityIds" TEXT[],
    "createrId" TEXT NOT NULL,
    "updaterId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizSet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuizSet" ADD CONSTRAINT "QuizSet_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSet" ADD CONSTRAINT "QuizSet_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizStage" ADD CONSTRAINT "QuizStage_quizSetId_fkey" FOREIGN KEY ("quizSetId") REFERENCES "QuizSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCampaignDomainLog" ADD CONSTRAINT "UserCampaignDomainLog_quizSetId_fkey" FOREIGN KEY ("quizSetId") REFERENCES "QuizSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
