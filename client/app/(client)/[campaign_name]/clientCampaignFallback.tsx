"use client";

import Spinner from "@/components/ui/spinner";
import { CampaignProvider } from "@/providers/campaignProvider";
import { Campaign } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ClientCampaignFallback({
  campaignName,
  children,
}: {
  campaignName: string;
  children: React.ReactNode;
}) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [error, setError] = useState<string | null>(
    "The network is unstable. Please try again later."
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchCampaign = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/campaigns?campaign_name=${campaignName}`;
      const response = await fetch(url, { method: "GET", cache: "no-cache" });
      console.log("ClientCampaignFallback fetchCampaign response", response);

      if (response.status === 404) {
        console.log("ClientCampaignFallback fetchCampaign 404");
        router.push("/error/not-found");
        return;
      }

      if (response.status >= 500) {
        console.log(
          `ClientCampaignFallback fetchCampaign ${response.status} 서버 오류`
        );
        setError("The network is unstable. Please try again later.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch campaign");
      }

      const data = (await response.json()) as { item: Campaign };
      if (!data.item) {
        router.push("/error/not-found");
        return;
      }

      setCampaign(data.item);
    } catch (err) {
      console.error("ClientCampaignFallback fetchCampaign error", err);
      setError("The network is unstable. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center h-full min-h-svh">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-w-[280px] max-w-[412px] w-full min-h-svh mx-auto text-base flex flex-col justify-center space-y-[19px]">
      {campaign ? (
        <CampaignProvider campaign={campaign}>{children}</CampaignProvider>
      ) : (
        <>
          <h1 className="text-xl text-center text-[#2686F5]">{error}</h1>
          <button
            onClick={fetchCampaign}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Retry
          </button>
        </>
      )}
    </div>
  );
}
