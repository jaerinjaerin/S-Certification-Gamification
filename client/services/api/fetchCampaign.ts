import { ApiResponse } from "@/types/apiTypes";
import { Campaign } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";

let cachedCampaigns: Record<string, ApiResponse<Campaign>> = {};
let lastFetchCampaignTime: Record<string, number> = {};
const CACHE_DURATION = 60000; // 60초 캐싱 (ms 단위)

export async function fetchCampaign(
  campaignName: string
): Promise<ApiResponse<Campaign>> {
  const now = Date.now();

  // ✅ 로컬 캐시에 데이터가 있고, 60초 이내라면 캐시된 데이터 반환
  if (
    cachedCampaigns[campaignName] &&
    lastFetchCampaignTime[campaignName] &&
    now - lastFetchCampaignTime[campaignName] < CACHE_DURATION
  ) {
    // console.info(`✅ 캐시된 (캠페인) 데이터 반환: ${campaignName}`);
    return cachedCampaigns[campaignName];
  }

  try {
    // ✅ API 요청 (fetch 사용)
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/campaigns?campaign_name=${campaignName}`;
    const response = await fetch(url, { method: "GET", cache: "no-store" });

    console.log(`🔗 API 요청: ${response.status}`);

    if (!response.ok) {
      return {
        item: null,
        success: false,
        message: "캠페인 데이터를 찾을 수 없습니다.",
        status: response.status,
      };
    }

    const data = await response.json();

    if (!data.item) {
      return {
        item: null,
        success: false,
        message: "캠페인 데이터를 찾을 수 없습니다.",
        status: response.status,
      };
    }

    // ✅ API 요청 성공 시 로컬 캐시에 저장
    cachedCampaigns[campaignName] = data;
    lastFetchCampaignTime[campaignName] = now;

    // console.info(`🔄 캐시 (캠페인) 업데이트: ${campaignName}`);

    return {
      item: data.item,
      success: true,
      message: "캠페인 데이터를 성공적으로 가져왔습니다.",
      status: response.status,
    };
  } catch (error) {
    console.error(`❌ fetchCampaign error: ${error}`);
    Sentry.captureException(error);

    return {
      item: null,
      success: false,
      message: "서버 오류가 발생했습니다. 다시 시도해주세요.",
      status: 500,
    };
  }
}
