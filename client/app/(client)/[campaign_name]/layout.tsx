import { CampaignProvider } from "@/providers/campaignProvider";

export default async function CampaignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <CampaignProvider>{children}</CampaignProvider>
    </div>
  );
}
