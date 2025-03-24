/*
  Warnings:

  - You are about to drop the column `userCount` on the `DomainGoal` table. All the data in the column will be lost.
  - Added the required column `ff` to the `DomainGoal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ffSes` to the `DomainGoal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fsm` to the `DomainGoal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fsmSes` to the `DomainGoal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DomainGoal" DROP COLUMN "userCount",
ADD COLUMN     "ff" INTEGER NOT NULL,
ADD COLUMN     "ffSes" INTEGER NOT NULL,
ADD COLUMN     "fsm" INTEGER NOT NULL,
ADD COLUMN     "fsmSes" INTEGER NOT NULL;
