/*
  Warnings:

  - You are about to drop the column `sumtotalJob` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `sumtotalStore` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "sumtotalJob",
DROP COLUMN "sumtotalStore",
ADD COLUMN     "sumtotalJobId" TEXT,
ADD COLUMN     "sumtotalStoreId" TEXT;
