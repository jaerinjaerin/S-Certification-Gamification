/*
  Warnings:

  - You are about to drop the column `admin_user_id` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `adminUserId` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the `admin_users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_admin_user_id_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_adminUserId_fkey";

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "admin_user_id";

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "adminUserId";

-- DropTable
DROP TABLE "admin_users";
