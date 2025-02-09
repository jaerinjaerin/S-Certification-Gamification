import { CampaignProvider } from "@/providers/campaignProvider";
import { fetchCampaign } from "@/services/api/fetchCampaign";
import * as Sentry from "@sentry/nextjs";
import { redirect } from "next/navigation";

export default async function CampaignLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { campaign_name: string };
}) {
  // ✅ 서버에서 fetchCampaign을 사용하여 캠페인 정보를 가져옴
  const campaign = await fetchCampaign(params.campaign_name);

  const routeCommonError = () => {
    redirect("/error");
  };

  if (!campaign) {
    console.error("Campaign not found", params.campaign_name);
    Sentry.captureMessage(`Campaign not found: ${params.campaign_name}`);
    routeCommonError();
    return;
  }

  return (
    <div className="min-w-[280px] max-w-[412px] w-full min-h-svh mx-auto text-base">
      <CampaignProvider campaign={campaign}>{children}</CampaignProvider>
    </div>
  );
}
