import { CampaignProvider } from "@/providers/campaignProvider";
import { redirect } from "next/navigation";

export default async function CampaignLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: any;
}) {
  console.log("CampaignLayout", params);

  const response = await fetch(
    `${process.env.API_URL}/api/campaigns?campaign_name=${params.campaign_name}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "force-cache",
    }
  );

  const routeCommonError = () => {
    redirect("/error");
  };

  if (!response.ok) {
    routeCommonError();
    return;
  }
  const data = await response.json();

  console.log("QuizProvider fetchData data", data);

  if (data.item == null) {
    routeCommonError();
    return;
  }

  console.info("Render CampaignLayout");
  return (
    <div>
      <CampaignProvider campaign={data.item}>{children}</CampaignProvider>
    </div>
  );
}
