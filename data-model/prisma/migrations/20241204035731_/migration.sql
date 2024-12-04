/*
  Warnings:

  - You are about to drop the column `sumtotalJobCode` on the `users` table. All the data in the column will be lost.
  - Added the required column `selectedOptionIds` to the `UserQuizQuestionLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserQuizQuestionLog" ADD COLUMN     "selectedOptionIds" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "sumtotalJobCode",
ADD COLUMN     "sumtotalJob" TEXT,
ADD COLUMN     "sumtotalStore" TEXT;
