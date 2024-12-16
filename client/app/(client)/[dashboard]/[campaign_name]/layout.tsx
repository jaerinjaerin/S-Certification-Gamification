import { CampaignProvider } from "@/providers/campaignProvider";
import { Campaign } from "@prisma/client";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function CampaignLayout({ children, params }: { children: React.ReactNode; params: { campaign_name: string } }) {
  console.log("CampaignLayout", params);

  const response = await fetch(`${process.env.API_URL}/api/campaigns?campaign_name=${params.campaign_name}`, {
    method: "GET",
    // headers: { "Content-Type": "application/json" },
    cache: "force-cache",
  });

  const routeCommonError = () => {
    redirect("/error");
  };

  if (!response.ok) {
    routeCommonError();
    return;
  }
  const data = (await response.json()) as { item: Campaign };

  console.log("QuizProvider fetchData data", data);

  if (data.item == null) {
    routeCommonError();
    return;
  }

  const messages = await getMessages();

  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");
  const acceptLanguageArray = acceptLanguage?.split(",");

  acceptLanguageArray?.map((language) => {
    const [langCode, weight] = language?.split(";");
  });

  console.log("acceptLanguage", acceptLanguage);

  console.info("Render CampaignLayout");
  return (
    <div className="h-full">
      <NextIntlClientProvider messages={messages}>
        <CampaignProvider campaign={data.item}>{children}</CampaignProvider>
      </NextIntlClientProvider>
    </div>
  );
}
