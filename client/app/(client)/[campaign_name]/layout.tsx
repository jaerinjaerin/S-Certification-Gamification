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
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/campaigns?campaign_name=${params.campaign_name}`;
  console.log("CampaignLayout url", url);
  const response = await fetch(url, {
    method: "GET",
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

  // console.log("QuizProvider fetchData data", data);

  if (data.item == null) {
    routeCommonError();
    return;
  }

  const locale = await getLocale();
  console.log("🥶", locale);

  // Providing all messages to the client
  // side is the easiest way to get started
  // const messages = await getMessages();

  return (
    <div
      className="min-w-[280px] max-w-[412px] w-full min-h-svh mx-auto"
      lang={locale}
    >
      <CampaignProvider campaign={data.item}>{children}</CampaignProvider>
    </div>
  );
}
