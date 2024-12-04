import LogoutButton from "@/app/components/button/logout_button";
import { CampaignDomainQuizSetEx } from "@/app/types/type";
import { auth } from "@/auth";
import { QuizProvider } from "@/providers/quiz_provider";
import { redirect } from "next/navigation";

export default async function QuizLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { quizset_path: string };
}) {
  const session = await auth();
  console.log("QuizLayout session", session);

  // Fetch data from API
  const fetchData = async (url: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Fetch error:", error);
      redirectToErrorPage();
      return null;
    }
  };

  // Redirect to error page
  const redirectToErrorPage = () => {
    redirect("/error/not-found");
  };

  // Fetch quiz data
  const quizData = await fetchData(
    `${process.env.API_URL}/api/campaigns/quizsets/${params.quizset_path}`,
    {
      method: "GET",
      // headers: { "Content-Type": "application/json" },
      cache: "force-cache",
    }
  );

  if (!quizData) {
    redirectToErrorPage();
    return null;
  }

  // Fetch quiz history
  let quizHistory = await fetchData(
    `${process.env.API_URL}/api/logs/quizzes/sets/${params.quizset_path}?userId=${session?.user.id}`,
    { cache: "no-cache" }
  );

  if (!quizHistory?.item) {
    // Initialize quiz history if not found
    const initHistoryResponse = await fetch(
      `${process.env.API_URL}/api/logs/quizzes/sets/${params.quizset_path}`,
      {
        method: "POST",
        // headers: {
        //   "Content-Type": "application/json",
        // },
        body: JSON.stringify({ userId: session?.user.id }),
      }
    );

    if (!initHistoryResponse.ok) {
      console.error("Failed to initialize quiz history:", initHistoryResponse);
      redirectToErrorPage();
      return null;
    }

    const initHistoryData = await initHistoryResponse.json();
    quizHistory = initHistoryData.item;
  } else {
    quizHistory = quizHistory.item;
  }

  console.info("Render QuizLayout");
  return (
    <div>
      <LogoutButton />
      <QuizProvider
        quizSet={quizData.item as CampaignDomainQuizSetEx}
        language={quizData.item.language}
        domain={quizData.item.domain}
        quizHistory={quizHistory}
        campaign={quizData.item.campaign}
      >
        {/* <QuizHistoryProvider
          quizHistory={quizHistory}
          domain={quizData.item.domain}
          campaign={quizData.item.campaign}
          language={quizData.item.language}
        > */}
        {children}
        {/* </QuizHistoryProvider> */}
      </QuizProvider>
    </div>
  );
}
