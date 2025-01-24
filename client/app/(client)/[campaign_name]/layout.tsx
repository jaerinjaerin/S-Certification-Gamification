import { CampaignProvider } from "@/providers/campaignProvider";
import { Campaign } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { redirect } from "next/navigation";

export default async function CampaignLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { campaign_name: string };
}) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/campaigns?campaign_name=${params.campaign_name}`;
  // // console.log("CampaignLayout url", url);
  const response = await fetch(url, {
    method: "GET",
    // cache: "force-cache",
  });

  const routeCommonError = () => {
    redirect("/error");
  };

  if (!response.ok) {
    console.error("Failed to fetch campaign", params.campaign_name);
    Sentry.captureMessage(`Failed to fetch campaign: ${params.campaign_name}`);
    routeCommonError();
    return;
  }
  const data = (await response.json()) as { item: Campaign };
  if (data.item == null) {
    console.error("Campaign not found");
    Sentry.captureMessage(`Campaign not found: ${params.campaign_name}`);
    routeCommonError();
    return;
  }

  return (
    <div className="min-w-[280px] max-w-[412px] w-full min-h-svh mx-auto text-base">
      <CampaignProvider campaign={data.item}>{children}</CampaignProvider>
    </div>
  );
}
