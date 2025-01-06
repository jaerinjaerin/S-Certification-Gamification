import { auth } from "@/auth";
import { AuthType, UserQuizLog } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function CampaignPage({
  params,
}: {
  params: { campaign_name: string };
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

  if (!session?.user) {
    redirect("/login");
  }

  // const url = `${process.env.NEXT_PUBLIC_API_URL}/api/campaigns?campaign_name=${params.campaign_name}`;
  // const response = await fetch(url, {
  //   method: "GET",
  //   // cache: "force-cache",
  //   cache: "no-cache",
  // });

  // const data = await response.json();
  // if (!data.item) {
  //   redirect("error-notfound");
  // }

  // console.info("CampaignPage campaign", data);

  const historyResponse = await fetch(
    // `${process.env.NEXT_PUBLIC_API_URL}/api/users/${session?.user.id}/logs/campaigns/${data.item.id}`,
    `${process.env.NEXT_PUBLIC_API_URL}/api/logs/quizzes/sets?user_id=${session?.user.id}&campaign_name=${params.campaign_name}`,
    {
      method: "GET",
      // cache: "force-cache",
      cache: "no-cache",
    }
  );

  let userQuizLog: UserQuizLog | null = null;
  if (historyResponse.ok) {
    console.error("CampaignPage quizHistory error", historyResponse);

    const historyData = await historyResponse.json();
    userQuizLog = historyData.item;
  }

  console.info("CampaignPage quizHistory", userQuizLog, session?.user);

  // 퀴즈로그가 있으면 해당 퀴즈셋으로 이동
  if (userQuizLog?.quizSetPath) {
    redirect(`${params.campaign_name}/${userQuizLog.quizSetPath}`);
  }

  // 퀴즈로그가 없고 게스트 유저라면 회원가입 페이지로 이동
  if (!userQuizLog && session?.user.authType === AuthType.GUEST) {
    console.log("gogo register");
    redirect(`${params.campaign_name}/register`);
  }

  // 퀴즈로그가 없고 삼플 유저라면 에러페이지로 이동
  return (
    <div>
      <h1>퀴즈 셋이 없습니다.</h1>
      <p>퀴즈로그가 없고 삼플 유저인 경우 (실제로 이런 경우는 거의 없음)</p>
    </div>
  );

  redirect("error/not-found");
}
