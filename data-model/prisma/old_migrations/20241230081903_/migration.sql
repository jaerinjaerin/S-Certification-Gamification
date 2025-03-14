-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "category" DROP NOT NULL,
ALTER COLUMN "specificFeature" DROP NOT NULL,
ALTER COLUMN "product" DROP NOT NULL,
ALTER COLUMN "importance" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserQuizQuestionLog" ALTER COLUMN "category" DROP NOT NULL,
ALTER COLUMN "product" DROP NOT NULL;
