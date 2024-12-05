import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function CampaignPage({
  params,
}: {
  params: { dashboard: string; campaign_name: string };
}) {
  console.info("CampaignPage page", params);
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
      // headers: { "Content-Type": "application/json" },
      // cache: "force-cache",
      cache: "no-cache",
    }
  );

  const data = await response.json();
  console.info("CampaignPage data", data, session?.user);

  if (!data.item) {
    redirect("error-notfound");
  }

  const historyResponse = await fetch(
    `${process.env.API_URL}/api/users/${session?.user.id}/logs/campaigns/${data.item.id}`,
    {
      method: "GET",
      // headers: { "Content-Type": "application/json" },
      // cache: "force-cache",
      cache: "no-cache",
    }
  );

  if (!historyResponse.ok) {
    console.error("CampaignPage quizHistory error", historyResponse);

    return <div>Server Error</div>;
  }

  const historyData = await historyResponse.json();

  console.info(
    "CampaignPage quizHistory",
    historyData
    // historyData.item.campaignDomainQuizSet
  );

  if (!historyData.item) {
    // redirect(`${params.dashboard}/${params.campaign_name}/register`);
    // redirect("error-notfound");
    console.log("gogo register");
    if (session?.user.provider !== "sumtotal") {
      redirect(`${params.campaign_name}/register`);
    }

    return (
      <div>
        <p>Sumtotal로 로그인했지만 잘못된 경로로 들어온 경우입니다.</p>
        <button>
          <a href={`${params.campaign_name}/ORG_502_ff_ko`}>이동</a>
        </button>
      </div>
    );
  }

  const campaignDomainQuizSet = historyData.item.campaignDomainQuizSet;

  if (campaignDomainQuizSet?.path) {
    redirect(
      `${params.dashboard}/${params.campaign_name}/${campaignDomainQuizSet.path}`
    );
  }

  redirect(`${params.dashboard}/${params.campaign_name}/register`);
}
