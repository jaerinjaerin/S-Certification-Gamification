import { auth } from "@/auth";
import { QuizProvider, QuizSetEx } from "@/providers/quiz_provider";
import { AuthType } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function QuizLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { campaign_name: string; quizset_path: string };
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

  // console.log("QuizLayout quizData", quizSetReponse);

  const quizSet: QuizSetEx | null = quizSetReponse.item;

  if (!quizSet) {
    redirectToErrorPage();
    return null;
  }

  // Fetch quiz history
  const quizLogResponse = await fetchData(
    `${process.env.NEXT_PUBLIC_API_URL}/api/logs/quizzes/sets/?user_id=${session?.user.id}&quizset_path=${params.quizset_path}`,
    {
      method: "GET",
      cache: "no-cache",
    }
  );

  let quizLog;
  let quizStageLogs;
  let quizQuestionLogs;

  // console.log("QuizLayout quizLogResponse", quizLogResponse, session?.user.id);

  if (quizLogResponse?.item.quizLog) {
    quizLog = quizLogResponse.item.quizLog;
    quizStageLogs = quizLogResponse.item.quizStageLogs;
    quizQuestionLogs = quizLogResponse.item.quizQuestionLogs;
  }

  // 다른 퀴즈페이지로 이동했는지 확인
  // console.log("QuizLayout quizLog", quizLog.quizSetPath, params.quizset_path);
  if (
    session?.user.authType === AuthType.SUMTOTAL &&
    quizLog?.quizSetPath != null &&
    quizLog?.quizSetPath !== params.quizset_path
  ) {
    console.log(
      "QuizLayout quizLog",
      quizLog?.quizSetPath,
      params.quizset_path
    );
    return (
      <div>
        <h1>퀴즈 페이지 이동</h1>
        <p>다른 퀴즈 페이지로 이동하셨습니다.</p>
      </div>
    );
  }

  if (session?.user.authType === AuthType.GUEST) {
    const userResponse = await fetchData(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/${session?.user.id}`,
      {
        method: "GET",
        cache: "no-cache",
      }
    );

    // console.log("QuizLayout userResponse", userResponse);

    if (!userResponse?.item) {
      return (
        <div>
          <h1>사용자 정보를 찾을 수 없습니다.</h1>
        </div>
      );
    }

    const user = userResponse.item;
    // console.log("QuizLayout user", user);
    if (user.jobId === null) {
      redirect(`/${params.campaign_name}/register`);
      return;
    }
  }

  console.log(
    "QuizLayout quizLog path",
    quizLog?.quizSetPath,
    params.quizset_path
  );

  if (
    quizLog?.quizSetPath != null &&
    quizLog?.quizSetPath !== params.quizset_path
  ) {
    redirect(`/${params.campaign_name}/${quizLog.quizSetPath}`);
    return;
  }

  // console.info("QuizLayout quizLog:", quizLog);
  return (
    <div
      className="h-full bg-[#F0F0F0]"
      style={{
        backgroundImage: `url('${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/images/bg_main2.png')`,
      }}
    >
      {/* <LogoutButton /> */}
      <QuizProvider
        quizSet={quizSet}
        language={quizSetReponse.item.language}
        quizLog={quizLog}
        quizStageLogs={quizStageLogs}
        quizQuestionLogs={quizQuestionLogs}
        userId={session?.user.id}
        authType={session?.user.authType}
        quizSetPath={params.quizset_path}
      >
        {children}
      </QuizProvider>
    </div>
  );
}
