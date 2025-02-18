// src/app/quiz/[campaign_name]/[quizset_path]/layout.tsx
import { auth } from "@/auth";
import RefreshButton from "@/components/error/refresh-button";
import { QuizProvider } from "@/providers/quizProvider";
import { fetchQuizLog } from "@/services/api/fetchQuizLog";
import { fetchQuizSet } from "@/services/api/fetchQuizSet";
// import { fetchQuizLog } from "@/services/quizService";
import { fetchUserInfo } from "@/services/userService";
import { ApiResponse, QuizSetEx } from "@/types/apiTypes";
import { hasSavedDetails } from "@/utils/userHelper";
import { AuthType, UserQuizLog, UserQuizStageLog } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
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
  console.log("userId", userId);

  if (!userId) {
    redirect("/login");
  }

  // ================== Quiz Setup ==================
  const quizResponse: ApiResponse<QuizSetEx> = await fetchQuizSet(
    params.quizset_path,
    userId
  );
  if (
    quizResponse.status != null &&
    quizResponse.status >= 400 &&
    quizResponse.status < 500
  ) {
    redirect("/error/not-found");
  }

  // 🚀 500번대 에러면 클라이언트에서 재시도 가능하도록 Fallback을 제공
  if (quizResponse.status != null && quizResponse.status >= 500) {
    console.error(
      "Server error while fetching quiz set",
      params.quizset_path,
      quizResponse
    );
    Sentry.captureMessage(
      `Server error while fetching quiz set: ${params.campaign_name}`
    );
    return <RefreshButton />;
  }

  // console.log("fetchQuizSet quizResponse", quizResponse);
  const quizSet = quizResponse.item;
  if (!quizSet) {
    redirect(`/${params.campaign_name}/not-ready`);
  }

  // ================== Quiz Log Setup ==================
  const quizLogResponse = await fetchQuizLog(userId, params.campaign_name);

  if (
    quizLogResponse.status != null &&
    quizLogResponse.status >= 400 &&
    quizLogResponse.status < 500
  ) {
    redirect(`/${params.campaign_name}/not-ready`);
  }

  if (quizLogResponse.status != null && quizLogResponse.status >= 500) {
    console.error(
      "Server error while fetching quiz log",
      params.campaign_name,
      quizLogResponse
    );
    Sentry.captureMessage(
      `Server error while fetching quiz log: ${params.campaign_name}, ${quizLogResponse}`
    );
    return <RefreshButton />;
  }

  const quizLog: UserQuizLog | null = quizLogResponse.item?.quizLog || null;
  const quizStageLogs: UserQuizStageLog[] | null =
    quizLogResponse.item?.quizStageLogs || null;

  // ================== Check User Details(Guest) ==================
  if (session?.user.authType === "GUEST") {
    const userResponse = await fetchUserInfo(userId);
    const user = userResponse.item;

    if (!hasSavedDetails(user)) {
      redirect(`/${params.campaign_name}/register`);
    }
  }

  // ================== Redirect if user is on a different quiz set ==================
  if (quizLog?.quizSetPath && quizLog.quizSetPath !== params.quizset_path) {
    redirect(`/${params.campaign_name}/${quizLog.quizSetPath}`);
  }

  return (
    <div
      className="h-full bg-[#F0F0F0]"
      style={{
        backgroundImage: `url('${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/images/bg_main2.jpg')`,
      }}
    >
      <QuizProvider
        campaignName={params.campaign_name}
        quizSetPath={params.quizset_path}
        quizSet={quizSet}
        // language={response.item.language}
        quizLog={quizLog}
        quizStageLogs={quizStageLogs}
        // quizQuestionLogs={result.quizQuestionLogs!}
        userId={userId}
        authType={session?.user.authType || AuthType.GUEST}
      >
        {children}
      </QuizProvider>
    </div>
  );
}

// type RedirectResult = {
//   redirectTo?: string; // 리다이렉션 대상 URL
//   quizSet?: any; // 퀴즈 세트 정보
//   quizLog?: UserQuizLog | null; // 퀴즈 로그
//   quizStageLogs?: UserQuizStageLog[] | null; // 퀴즈 스테이지 로그
//   // quizQuestionLogs?: UserQuizQuestionLog[] | null; // 퀴즈 질문 로그
//   user?: any; // 사용자 정보
// };

// async function handleQuizSetup(
//   params: { campaign_name: string; quizset_path: string },
//   userId: string,
//   session: Session | null
// ): Promise<RedirectResult> {
//   try {
//     // 1. Fetch quiz set
//     const response = await fetchQuizSet(params.quizset_path, userId);
//     if (response.status === 404) {
//       return { redirectTo: `/${params.campaign_name}/not-ready` };
//     }

//     // 🚀 500번대 에러면 클라이언트에서 재시도 가능하도록 Fallback을 제공
//     if (response.status != null && response.status >= 500) {
//       console.error(
//         "Server error while fetching quiz set",
//         params.campaign_name
//       );
//       Sentry.captureMessage(`Server error: ${params.campaign_name}`);
//       return (
//         <ClientCampaignFallback campaignName={params.campaign_name}>
//           {children}
//         </ClientCampaignFallback>
//       );
//     }

//     // console.log("fetchQuizSet response", response);
//     const quizSet = response.item;

//     if (!quizSet) {
//       return { redirectTo: `/${params.campaign_name}/not-ready` };
//     }

//     // 2. Fetch quiz logs
//     const quizLogResponse = await fetchQuizLog(userId, params.campaign_name);
//     const quizLog: UserQuizLog | null = quizLogResponse.item?.quizLog || null;
//     const quizStageLogs: UserQuizStageLog[] | null =
//       quizLogResponse.item?.quizStageLogs || null;
//     // const quizQuestionLogs: UserQuizQuestionLog[] | null =
//     //   quizLogResponse.item?.quizQuestionLogs || null;

//     // 3. Check guest user details
//     if (session?.user.authType === "GUEST") {
//       const userResponse = await fetchUserInfo(userId);
//       const user = userResponse.item;

//       if (!hasSavedDetails(user)) {
//         return { redirectTo: `/${params.campaign_name}/register` };
//       }
//     }

//     // 4. Redirect if user is on a different quiz set
//     if (quizLog?.quizSetPath && quizLog.quizSetPath !== params.quizset_path) {
//       return { redirectTo: `/${params.campaign_name}/${quizLog.quizSetPath}` };
//     }

//     // Return collected data if no redirection is needed
//     return {
//       quizSet,
//       quizLog,
//       quizStageLogs,
//       // quizQuestionLogs,
//     };
//   } catch (error) {
//     Sentry.captureException(error, (scope) => {
//       scope.setContext("operation", {
//         type: "http_request",
//         endpoint: "handleQuizSetup",
//         method: "POST",
//         description: "Failed to handle quiz setup",
//       });
//       scope.setTag("userId", userId);
//       scope.setTag("campaign_name", params.campaign_name);
//       scope.setTag("quizset_path", params.quizset_path);
//       return scope;
//     });
//     return { redirectTo: "/error" };
//   }
// }
