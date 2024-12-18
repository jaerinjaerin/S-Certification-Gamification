import { QuizSetEx } from "@/app/types/type";
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
  const quizSetReponse = await fetchData(
    `${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/quizsets/${params.quizset_path}`,
    {
      method: "GET",
      // headers: { "Content-Type": "application/json" },
      // cache: "force-cache",
      cache: "no-cache",
    }
  );

  console.log("QuizLayout quizData", quizSetReponse);

  if (!quizSetReponse?.item) {
    redirectToErrorPage();
    return null;
  }

  // Fetch quiz history
  const quizLogResponse = await fetchData(
    `${process.env.NEXT_PUBLIC_API_URL}/api/logs/quizzes/sets/?user_id=${session?.user.id}&quizset_path=${params.quizset_path}`,
    {
      cache: "no-cache",
    }
  );

  // if (!quizHistory?.item) {
  //   const initHistoryResponse = await fetch(
  //     `${process.env.API_URL}/api/users/${session?.user.id}/register`,
  //     {
  //       method: "PUT",
  //       body: JSON.stringify({ quizset_path: params.quizset_path }),
  //     }
  //   );

  //   if (!initHistoryResponse.ok) {
  //     console.error("Failed to initialize quiz history:", initHistoryResponse);
  //     redirectToErrorPage();
  //     return null;
  //   }

  //   const initHistoryData = await initHistoryResponse.json();
  //   quizHistory = initHistoryData.item.userQuizLog;
  // } else {
  //   quizHistory = quizHistory.item;
  // }

  let quizLog;
  let quizStageLogs;

  console.log("QuizLayout quizLogResponse", quizLogResponse);

  if (!quizLogResponse?.item.quizLog) {
    // Initialize quiz history if not found
    const initHistoryResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/logs/quizzes/sets/?quizset_path=${params.quizset_path}`,
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

    quizLog = initHistoryData.item.quizLog;
    quizStageLogs = initHistoryData.item.quizStageLogs;
  } else {
    quizLog = quizLogResponse.item.quizLog;
    quizStageLogs = quizLogResponse.item.quizStageLogs;
  }

  // 다른 퀴즈페이지로 이동했는지 확인
  console.log("QuizLayout quizLog", quizLog.quizSetPath, params.quizset_path);
  if (quizLog.quizSetPath !== params.quizset_path) {
    return (
      <div>
        <h1>퀴즈 페이지 이동</h1>
        <p>다른 퀴즈 페이지로 이동하셨습니다.</p>
      </div>
    );
  }

  console.info("Render QuizLayout", quizLog);
  return (
    <div
      className="h-full bg-[#F0F0F0]"
      style={{ backgroundImage: `url('/assets/bg_main2.png')` }}
    >
      {/* <LogoutButton /> */}
      <QuizProvider
        quizSet={quizSetReponse.item as QuizSetEx}
        language={quizSetReponse.item.language}
        quizLog={quizLog}
        quizStageLogs={quizStageLogs}
        // domain={quizLog.domain as Domain}
        // campaign={quizData.item.campaign as Campaign}
      >
        {children}
      </QuizProvider>
    </div>
  );
}
