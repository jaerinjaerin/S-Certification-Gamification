-- AlterTable
ALTER TABLE "Domain" ADD COLUMN     "permissionId" TEXT;

-- AddForeignKey
ALTER TABLE "Domain" ADD CONSTRAINT "Domain_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
