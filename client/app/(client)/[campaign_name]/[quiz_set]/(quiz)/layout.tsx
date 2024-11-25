import LogoutButton from "@/app/components/button/logout_button";
import { CampaignDomainQuizSetEx } from "@/app/types/type";
import { QuizHistoryProvider } from "@/providers/quiz_history_provider";
import { QuizProvider } from "@/providers/quiz_provider";

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: any;
}) {
  console.log("ClientLayout", params);

  const response = await fetch(
    `${process.env.API_URL}/api/campaign/quiz_set/${params.quiz_set}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "force-cache",
      // cache: "no-cache",
    }
  );

  const routeCommonError = (status: number) => {
    const currentUrl = new URL(window.location.href);
    const queryString = currentUrl.search; // 현재 URL의 query string 추출
    const targetUrl = `/error${queryString}`; // /quiz 뒤에 query string 추가
    window.location.href = targetUrl;
  };

  if (!response.ok) {
    routeCommonError(response.status);
    return;
  }
  const data = await response.json();

  console.log("QuizProvider fetchData data", data);
  // setQuizSet(data.item);
  // setLanguage(data.item.language);

  // const searchParams = useSearchParams();
  // const quizsetId = searchParams.get("quizset_id");

  // if (quizsetId === null) {
  //   window.location.href = "/error/invalid-access";
  // }

  // async function fetchData(quizSetId: string | null) {
  //   if (!quizSetId) return null;

  //   try {
  //     const response = await fetch(`/api/campaign/quiz_set/${quizSetId}`);
  //     if (!response.ok) {
  //       throw new Error("Failed to fetch data");
  //     }
  //     const data = await response.json();
  //     return data;
  //   } catch (error) {
  //     console.error(error);
  //     return null;
  //   }
  // }

  // const data = await fetchData(quizsetId);
  // console.log("data:", data);

  // if (!data.item || !data.item.campaign) {
  //   window.location.href = "/error/invalid-access";
  // }

  // if (data.item.campaign.startedAt < new Date()) {
  //   window.location.href = "/error/invalid-access";
  // }

  // if (data.item.campaign.endedAt > new Date()) {
  //   window.location.href = "/error/campaign-closed";
  // }

  return (
    <div>
      {/* <LocalStorageProvider> */}
      {/* <AuthProvider> */}
      <LogoutButton />
      <QuizProvider
        quizSet={data.item as CampaignDomainQuizSetEx}
        language={data.item.language}
      >
        <QuizHistoryProvider>{children}</QuizHistoryProvider>
      </QuizProvider>
      {/* </AuthProvider> */}
      {/* </LocalStorageProvider> */}
    </div>
  );
}
