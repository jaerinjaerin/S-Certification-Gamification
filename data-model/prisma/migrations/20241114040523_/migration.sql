-- CreateTable
CREATE TABLE "CountryActivity" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "countryId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,

    CONSTRAINT "CountryActivity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CountryActivity" ADD CONSTRAINT "CountryActivity_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
