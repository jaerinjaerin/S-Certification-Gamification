import LogoutButton from "@/app/components/button/logout_button";
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
      <QuizProvider>
        <QuizHistoryProvider>{children}</QuizHistoryProvider>
      </QuizProvider>
      {/* </AuthProvider> */}
      {/* </LocalStorageProvider> */}
    </div>
  );
}
