import * as Sentry from "@sentry/nextjs";

let cachedCampaign: Record<string, any> = {};
let lastFetchTime: Record<string, number> = {};
const CACHE_DURATION = 120000; // 120초 캐싱

export async function fetchCampaign(campaignName: string): Promise<any | null> {
  const now = Date.now();

  // ✅ 캐시된 데이터가 있고, 60초 이내라면 캐시된 데이터 반환
  if (
    cachedCampaign[campaignName] &&
    lastFetchTime[campaignName] &&
    now - lastFetchTime[campaignName] < CACHE_DURATION
  ) {
    return cachedCampaign[campaignName];
  }

  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/campaigns?campaign_name=${campaignName}`;
    const response = await fetch(url, { method: "GET", cache: "no-store" });

    if (response.status === 404) {
      console.log("fetchCampaign 404: Campaign not found");
      return null;
    }

    if (response.status >= 500) {
      console.log(`fetchCampaign ${response.status} 서버 오류`);
      throw new Error(`Server error: ${response.status}`);
    }

    if (!response.ok) {
      throw new Error("Failed to fetch campaign");
    }

    const data = await response.json();
    if (!data.item) {
      return null;
    }

    // ✅ 성공 시 캐싱
    cachedCampaign[campaignName] = data.item;
    lastFetchTime[campaignName] = now;

    return data.item;
  } catch (error) {
    console.error("fetchCampaign error", error);
    Sentry.captureException(error);
    return null;
  }
}
