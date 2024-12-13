/*
  Warnings:

  - The `selectedOptionIds` column on the `UserQuizQuestionLog` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "UserQuizQuestionLog" DROP COLUMN "selectedOptionIds",
ADD COLUMN     "selectedOptionIds" TEXT[];
