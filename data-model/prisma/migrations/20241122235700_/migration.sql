/*
  Warnings:

  - You are about to drop the column `jobCode` on the `SalesFormat` table. All the data in the column will be lost.
  - Added the required column `jobId` to the `SalesFormat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SalesFormat" DROP COLUMN "jobCode",
ADD COLUMN     "jobId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "SalesFormat" ADD CONSTRAINT "SalesFormat_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
