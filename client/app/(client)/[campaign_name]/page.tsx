"use client";

export default function CampaignPage() {
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

  return (
    <div>
      <h1>Check User Status</h1>
      <p>Loading</p>
    </div>
  );
}
