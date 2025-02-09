import { CampaignProvider } from "@/providers/campaignProvider";
import { fetchCampaign } from "@/services/api/fetchCampaign";
import * as Sentry from "@sentry/nextjs";
import { redirect } from "next/navigation";
import ClientCampaignFallback from "./clientCampaignFallback";

export default async function CampaignLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { campaign_name: string };
}) {
  // ✅ 서버에서 fetchCampaign을 사용하여 캠페인 정보를 가져옴
  const campaignResponse = await fetchCampaign(params.campaign_name);

  // 🚀 404 에러면 바로 not-found 페이지로 이동
  if (campaignResponse.status === 404) {
    console.error("Campaign not found", params.campaign_name);
    Sentry.captureMessage(`Campaign not found: ${params.campaign_name}`);
    redirect("/error/not-found");
    return;
  }

  // 🚀 500번대 에러면 클라이언트에서 재시도 가능하도록 Fallback을 제공
  if (campaignResponse.status === 500) {
    console.error("Server error while fetching campaign", params.campaign_name);
    Sentry.captureMessage(`Server error: ${params.campaign_name}`);
    return (
      <ClientCampaignFallback campaignName={params.campaign_name}>
        {children}
      </ClientCampaignFallback>
    );
  }

  return (
    <div className="min-w-[280px] max-w-[412px] w-full min-h-svh mx-auto text-base">
      <CampaignProvider campaign={campaignResponse.item!}>
        {children}
      </CampaignProvider>
    </div>
  );
}
