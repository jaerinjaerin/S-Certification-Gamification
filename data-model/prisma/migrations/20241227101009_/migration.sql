/*
  Warnings:

  - You are about to drop the `UserEmail` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `authType` to the `UserQuizBadgeStageLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authType` to the `UserQuizLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authType` to the `UserQuizQuestionLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authType` to the `UserQuizStageLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserQuizBadgeStageLog" ADD COLUMN     "authType" "AuthType" NOT NULL;

-- AlterTable
ALTER TABLE "UserQuizLog" ADD COLUMN     "authType" "AuthType" NOT NULL;

-- AlterTable
ALTER TABLE "UserQuizQuestionLog" ADD COLUMN     "authType" "AuthType" NOT NULL;

-- AlterTable
ALTER TABLE "UserQuizStageLog" ADD COLUMN     "authType" "AuthType" NOT NULL;

-- DropTable
DROP TABLE "UserEmail";
