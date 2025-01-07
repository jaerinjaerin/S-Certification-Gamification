// src/app/quiz/[campaign_name]/[quizset_path]/layout.tsx
import { auth } from "@/auth";
import { QuizProvider } from "@/providers/quiz_provider";
import {
  redirectToCampaignNotReady,
  redirectToQuizSet,
  redirectToRegisterPage,
} from "@/route/redirectHelpers";
import { fetchQuizLog, fetchQuizSet } from "@/services/quizService";
import { fetchUserInfo } from "@/services/userService";
import { hasSavedDetails } from "@/utils/userHelper";
import {
  UserQuizLog,
  UserQuizQuestionLog,
  UserQuizStageLog,
} from "@prisma/client";
import { redirect } from "next/navigation";

export default async function QuizLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { campaign_name: string; quizset_path: string };
}) {
  const session = await auth();
  const userId = session?.user.id;

  if (!userId) {
    redirect("/login");
  }

  try {
    // 1. Fetch quiz set data
    const quizSetResponse = await fetchQuizSet(params.quizset_path, userId);
    const quizSet = quizSetResponse.item;

    if (!quizSet) {
      redirectToCampaignNotReady();
      return null;
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
        redirectToRegisterPage(params.campaign_name);
        return null;
      }
    }

    // 4. Redirect if user is on a different quiz set
    if (quizLog?.quizSetPath && quizLog.quizSetPath !== params.quizset_path) {
      redirectToQuizSet(params.campaign_name, quizLog.quizSetPath);
      return null;
    }

    // 5. Render children with QuizProvider
    return (
      <div
        className="h-full bg-[#F0F0F0]"
        style={{
          backgroundImage: `url('${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/images/bg_main2.jpg')`,
        }}
      >
        <QuizProvider
          quizSet={quizSet}
          // language={quizSetResponse.item.language}
          quizLog={quizLog}
          quizStageLogs={quizStageLogs}
          quizQuestionLogs={quizQuestionLogs}
          userId={userId}
          authType={session?.user.authType}
          quizSetPath={params.quizset_path}
        >
          {children}
        </QuizProvider>
      </div>
    );
  } catch (error) {
    console.error("Error in QuizLayout:", error);
    redirect("/error/not-found");
    return null;
  }
}
