/*
  Warnings:

  - You are about to drop the column `order` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the `SalesFormat` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `originalIndex` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "order",
ADD COLUMN     "originalIndex" INTEGER NOT NULL;

-- DropTable
DROP TABLE "SalesFormat";
