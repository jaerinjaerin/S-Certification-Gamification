import { getCampaignByName } from "@/app/actions/campaign-actions";
import RefreshButton from "@/components/error/refresh-button";
import { CampaignProvider } from "@/providers/campaignProvider";
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
  // const response = await fetchCampaign(params.campaign_name);
  const response = await getCampaignByName(params.campaign_name);
  // console.log("CampaignLayout response", response);

  // 🚀 404 에러면 바로 not-found 페이지로 이동
  if (response.status === 404) {
    console.error("Campaign not found", params.campaign_name, response);
    Sentry.captureMessage(`Campaign not found: ${params.campaign_name}`);
    redirect("/error/not-found");
  }

  // 🚀 500번대 에러면 클라이언트에서 재시도 가능하도록 Fallback을 제공
  if (response.status != null && response.status >= 500) {
    console.error(
      "Server error while fetching campaign",
      params.campaign_name,
      response
    );
    Sentry.captureMessage(`Server error: ${params.campaign_name}`);
    return <RefreshButton />;
  }

  const campaign = response.result?.item;
  if (!campaign) {
    console.error("Campaign not found", params.campaign_name, response);
    Sentry.captureMessage(`Campaign not found: ${params.campaign_name}`);
    redirect("/error/not-found");
  }

  return (
    <div className="min-w-[280px] max-w-[412px] w-full min-h-svh mx-auto text-base">
      <CampaignProvider campaign={campaign}>{children}</CampaignProvider>
    </div>
  );
}
