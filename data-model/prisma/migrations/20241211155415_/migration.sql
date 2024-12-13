/*
  Warnings:

  - Added the required column `region` to the `Domain` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subsidary` to the `Domain` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `Domain` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Domain" ADD COLUMN     "region" TEXT NOT NULL,
ADD COLUMN     "subsidary" TEXT NOT NULL,
ALTER COLUMN "name" SET NOT NULL;
