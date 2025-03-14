import { getQuizLog } from "@/app/actions/log-actions";
import { getQuizSet } from "@/app/actions/quiz-actions";
import { auth } from "@/auth";
import RefreshButton from "@/components/error/refresh-button";
import {
  getServiceLanguageCode,
  mapBrowserLanguageToLocale,
} from "@/i18n/locale";
import { QuizProvider } from "@/providers/quizProvider";
import { fetchUserInfo } from "@/services/userService";
import { ApiResponseV2, QuizSetEx } from "@/types/apiTypes";
import { extractCodesFromPath } from "@/utils/pathUtils";
import { hasSavedDetails } from "@/utils/userHelper";
import { AuthType, UserQuizLog, UserQuizStageLog } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { Session } from "next-auth";
import { NextIntlClientProvider } from "next-intl";
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
  const authType = session?.user.authType;
  const timeZone = "Seoul/Asia";

  let locale: string = "en";

  console.log("userId", userId);

  if (!userId) {
    redirect("/login");
  }

  console.log("🥕 authType", session.user.authType);

  // guest 유저의 경우
  if (authType === "GUEST") {
    console.log("🥕 params.campaign_name", params.campaign_name);
    locale = await getServiceLanguageCode(params.campaign_name ?? "s25");
  }

  // sumtotal 유저의 경우

  if (authType === "SUMTOTAL") {
    const codes = extractCodesFromPath(params.quizset_path);

    if (!codes) {
      redirect("/error/not-found");
    }

    const { languageCode } = codes;

    // 패턴에 맞는 형식으로 languageCode 변환 (fr-FR-TN -> fr-FR)
    const normalizedLanguageCode = languageCode.replace(
      /^([A-Za-z]{2}-[A-Za-z]{2})-([a-zA-Z]{2})$/,
      "$1",
    );

    locale = await mapBrowserLanguageToLocale(
      normalizedLanguageCode,
      params.campaign_name,
    );
    console.log("QuizSetLoginLayout locale:", locale);
  }

  const url = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/${params.campaign_name}/messages/${locale}.json`;
  const messages = await fetch(url, { cache: "force-cache" })
    .then((res) => res.json())
    .catch((error) => console.error("get message error", error));

  // ================== Quiz Log Setup ==================
  const quizLogResponse = await getQuizLog(userId, params.campaign_name);

  // const quizLogResponse = await fetchQuizLog(userId, params.campaign_name);
  console.log("QuizLayout quizLogResponse", quizLogResponse);
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
      quizLogResponse,
    );
    Sentry.captureMessage(
      `Server error while fetching quiz log: ${params.campaign_name}, ${quizLogResponse}`,
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

  // ================== Quiz Setup ==================
  const quizResponse: ApiResponseV2<QuizSetEx> = await getQuizSet(
    params.quizset_path,
    userId,
    params.campaign_name,
  );

  console.log("getQuizSet quizResponse", quizResponse);
  // const quizResponse: ApiResponse<QuizSetEx> = await fetchQuizSet(
  //   params.campaign_name,
  //   params.quizset_path,
  //   userId
  // );
  if (quizResponse.status === 404) {
    redirect(`/${params.campaign_name}/not-ready`);
  }

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
      quizResponse,
    );
    Sentry.captureMessage(
      `Server error while fetching quiz set: ${params.campaign_name}`,
    );
    return <RefreshButton />;
  }

  // console.log("fetchQuizSet quizResponse", quizResponse);
  const quizSet = quizResponse.result?.item;
  console.log("QuizLayout quizSet", quizSet);
  if (!quizSet) {
    redirect(`/${params.campaign_name}/not-ready`);
  }

  return (
    <div
      className="h-full bg-[#F0F0F0]"
      style={{
        backgroundImage: `url('${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/common/images/bg_main2.jpg')`,
      }}
    >
      <NextIntlClientProvider
        timeZone={timeZone}
        messages={messages}
        locale={locale}
      >
        <QuizProvider
          campaignName={params.campaign_name}
          quizSetPath={params.quizset_path}
          quizSet={quizSet}
          quizLog={quizLog}
          quizStageLogs={quizStageLogs}
          userId={userId}
          authType={session?.user.authType || AuthType.GUEST}
        >
          {children}
        </QuizProvider>
      </NextIntlClientProvider>
    </div>
  );
}
