-- AddForeignKey
ALTER TABLE "CountryActivity" ADD CONSTRAINT "CountryActivity_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
