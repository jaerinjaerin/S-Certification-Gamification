import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function CampaignPage({
  children,
  params,
}: {
  children: React.ReactNode;
  params: any;
}) {
  // export default async function CampaignPage() {
  // 유저가 삼플 유저인지. 삼플 미사용 유저인지 확인
  // 삼플 유저라면 유저 정보에 퀴즈 셋 정보가 등록되어 있는지 확인
  // 등록되어 있으면 [campaign_name]/[quizset_path]로 이동
  // 등록되어 있지 않으면 error-notfound로 이동
  // 삼플 미사용 유저라면 퀴즈 셋 정보가 등록되어 있는지 확인
  // 등록되어 있으면 [campaign_name]/[quizset_path]로 이동
  // 등록되어 있지 않으면 [campaign_name]/register로 이동

  // const { data: session } = useSession();
  // // const { routeToPage } = usePathNavigator();

  // console.info("CampaignPage session", session);

  // if (!session) {
  //   routeToPage("/login");
  //   return;
  // }
  // const { campaign } = useCampaign();
  // const { data: session } = useSession();
  const session = await auth();

  const response = await fetch(
    `${process.env.API_URL}/api/campaigns?campaign_name=${params.campaign_name}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "force-cache",
    }
  );

  const data = await response.json();
  console.info("CampaignPage data", data, session?.user.id);

  const historyResponse = await fetch(
    `${process.env.API_URL}/api/users/${session?.user.id}/logs/campaigns/${data.item.id}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "force-cache",
    }
  );

  if (!historyResponse.ok) {
    console.error("CampaignPage quizHistory error", historyResponse);
    return <div>Error</div>;
  }

  const historyData = await historyResponse.json();

  console.info(
    "CampaignPage quizHistory",
    historyData.item.campaignDomainQuizSet
  );

  const campaignDomainQuizSet = historyData.item.campaignDomainQuizSet;

  if (campaignDomainQuizSet?.path) {
    redirect(`${params.campaign_name}/${campaignDomainQuizSet.path}`);
  }

  redirect(`${params.campaign_name}/register`);
}
