-- DropForeignKey
ALTER TABLE "Domain" DROP CONSTRAINT "Domain_subsidaryId_fkey";

-- DropForeignKey
ALTER TABLE "QuizSet" DROP CONSTRAINT "QuizSet_domainId_fkey";

-- DropForeignKey
ALTER TABLE "Region" DROP CONSTRAINT "Region_hqId_fkey";

-- DropForeignKey
ALTER TABLE "Subsidary" DROP CONSTRAINT "Subsidary_regionId_fkey";

-- AlterTable
ALTER TABLE "Domain" ALTER COLUMN "subsidaryId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "QuizSet" ADD COLUMN     "subsidaryId" TEXT,
ALTER COLUMN "domainId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Region" ALTER COLUMN "hqId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Subsidary" ALTER COLUMN "regionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Region" ADD CONSTRAINT "Region_hqId_fkey" FOREIGN KEY ("hqId") REFERENCES "Hq"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subsidary" ADD CONSTRAINT "Subsidary_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Domain" ADD CONSTRAINT "Domain_subsidaryId_fkey" FOREIGN KEY ("subsidaryId") REFERENCES "Subsidary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSet" ADD CONSTRAINT "QuizSet_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSet" ADD CONSTRAINT "QuizSet_subsidaryId_fkey" FOREIGN KEY ("subsidaryId") REFERENCES "Subsidary"("id") ON DELETE SET NULL ON UPDATE CASCADE;
