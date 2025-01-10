// src/app/quiz/[campaign_name]/[quizset_path]/layout.tsx
import { auth } from "@/auth";
import { QuizProvider } from "@/providers/quiz_provider";
import { fetchQuizLog, fetchQuizSet } from "@/services/quizService";
import { fetchUserInfo } from "@/services/userService";
import { hasSavedDetails } from "@/utils/userHelper";
import {
  UserQuizLog,
  UserQuizQuestionLog,
  UserQuizStageLog,
} from "@prisma/client";
import { Session } from "next-auth";
import { redirect } from "next/navigation";

export default async function QuizLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { campaign_name: string; quizset_path: string };
}) {
  const session: Session | null = await auth();
  const userId = session?.user.id;

  if (!userId) {
    redirect("/login");
  }

  const result: RedirectResult = await handleQuizSetup(params, userId, session);
  if (result.redirectTo) {
    redirect(result.redirectTo);
  }

  return (
    <div
      className="h-full bg-[#F0F0F0]"
      style={{
        backgroundImage: `url('${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/images/bg_main2.jpg')`,
      }}
    >
      <QuizProvider
        quizSet={result.quizSet}
        // language={quizSetResponse.item.language}
        quizLog={result.quizLog!}
        quizStageLogs={result.quizStageLogs!}
        quizQuestionLogs={result.quizQuestionLogs!}
        userId={userId}
        authType={session?.user.authType}
        quizSetPath={params.quizset_path}
      >
        {children}
      </QuizProvider>
    </div>
  );
}

type RedirectResult = {
  redirectTo?: string; // 리다이렉션 대상 URL
  quizSet?: any; // 퀴즈 세트 정보
  quizLog?: UserQuizLog | null; // 퀴즈 로그
  quizStageLogs?: UserQuizStageLog[] | null; // 퀴즈 스테이지 로그
  quizQuestionLogs?: UserQuizQuestionLog[] | null; // 퀴즈 질문 로그
  user?: any; // 사용자 정보
};

async function handleQuizSetup(
  params: { campaign_name: string; quizset_path: string },
  userId: string,
  session: Session | null
): Promise<RedirectResult> {
  // 1. Fetch quiz set
  const quizSetResponse = await fetchQuizSet(params.quizset_path, userId);
  const quizSet = quizSetResponse.item;

  if (!quizSet) {
    return { redirectTo: `/${params.campaign_name}/not-ready` };
  }

  // 2. Fetch quiz logs
  const quizLogResponse = await fetchQuizLog(userId, params.campaign_name);
  const quizLog: UserQuizLog | null = quizLogResponse.item?.quizLog || null;
  const quizStageLogs: UserQuizStageLog[] | null =
    quizLogResponse.item?.quizStageLogs || null;
  const quizQuestionLogs: UserQuizQuestionLog[] | null =
    quizLogResponse.item?.quizQuestionLogs || null;

  // 3. Check guest user details
  if (session?.user.authType === "GUEST") {
    const userResponse = await fetchUserInfo(userId);
    const user = userResponse.item;

    if (!hasSavedDetails(user)) {
      return { redirectTo: `/${params.campaign_name}/register` };
    }
  }

  // 4. Redirect if user is on a different quiz set
  if (quizLog?.quizSetPath && quizLog.quizSetPath !== params.quizset_path) {
    return { redirectTo: `/${params.campaign_name}/${quizLog.quizSetPath}` };
  }

  // Return collected data if no redirection is needed
  return {
    quizSet,
    quizLog,
    quizStageLogs,
    quizQuestionLogs,
  };
}
