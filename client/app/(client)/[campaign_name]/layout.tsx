import { CampaignProvider } from "@/providers/campaignProvider";
import { Campaign } from "@prisma/client";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function CampaignLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { campaign_name: string };
}) {
  console.log("CampaignLayout", params);

  const url = `${process.env.API_URL}/api/campaigns?campaign_name=${params.campaign_name}`;
  console.log("url", url);
  const response = await fetch(url, {
    method: "GET",
    // headers: { "Content-Type": "application/json" },
    cache: "force-cache",
  });

  console.log("CampaignLayout response", response);

  const routeCommonError = () => {
    redirect("/error");
  };

  if (!response.ok) {
    // routeCommonError();
    return (
      <div>
        <h1>404 Not Found</h1>
      </div>
    );
    return;
  }
  const data = (await response.json()) as { item: Campaign };

  // console.log("QuizProvider fetchData data", data);

  if (data.item == null) {
    routeCommonError();
    return;
  }

  const locale = await getLocale();

  // Providing all messages to the client
  // side is the easiest way to get started
  // const messages = await getMessages();

  console.info("Render CampaignLayout");
  return (
    <div className="min-w-[280px] max-w-[412px] w-full min-h-svh" lang={locale}>
      {/* <NextIntlClientProvider messages={messages}> */}
      {/* <AuthProvider> */}
      <CampaignProvider campaign={data.item}>{children}</CampaignProvider>
      {/* </AuthProvider> */}
      {/* </NextIntlClientProvider> */}
    </div>
    // <div className="h-full">
    //   <CampaignProvider campaign={data.item}>{children}</CampaignProvider>
    // </div>
  );
}
