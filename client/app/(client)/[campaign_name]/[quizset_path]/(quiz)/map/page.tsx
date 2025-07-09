"use client";

// React
import { Fragment, useEffect, useRef, useState } from "react";
import { getSession, signOut } from "next-auth/react";

import { AuthType } from "@prisma/client";
// Components
import Connection from "@/components/map/connection";
import EmailTestButton from "@/components/button/email-test-button";
import Gradient from "@/components/map/gradient";
import PolicyRenderer from "@/components/policy-renderer";
// Types
import { QuizStageEx } from "@/types/apiTypes";
import { ResultAlertDialog } from "@/components/dialog/result-alert-dialog";
import { StageMarker } from "@/components/map/stage-marker";
import TutorialGuidePopup from "@/components/map/tutorial-guide-popup";
// Utils
import { cn } from "@/utils/utils";
import { extractCodesFromPath } from "@/utils/pathUtils";
// Hooks
import useGAPageView from "@/core/monitoring/ga/usePageView";
import useLoader from "@/components/ui/loader";
// Providers
import { useQuiz } from "@/providers/quizProvider";
// Next
import { useRouter } from "next/navigation";
// Next-intl
import { useTranslations } from "next-intl";

export default function QuizMap({ params }: { params: { campaign_name: string; quizset_path: string } }) {
  useGAPageView();

  const router = useRouter();
  const translation = useTranslations();
  const { quizSet, quizStagesTotalScore, currentQuizStageIndex, quizStageLogs } = useQuiz();
  const { Loader, startLoading, stopLoading } = useLoader();
  const codes = extractCodesFromPath(params.quizset_path);
  const domainCode = codes?.domainCode;

  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const isCheckSumTotalTokenExpirationRef = useRef(false); // 실행 상태를 추적
  const [needSignOut, setNeedSignOut] = useState<boolean>(false);

  useEffect(() => {
    const targetStage = itemsRef.current[currentQuizStageIndex];

    if (!targetStage) return;

    targetStage.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [currentQuizStageIndex]);

  const checkSumTotalTokenExpiration = async () => {
    if (isCheckSumTotalTokenExpirationRef.current) {
      return; // 이미 실행 중인 경우 종료
    }

    isCheckSumTotalTokenExpirationRef.current = true; // 실행 상태 설정

    try {
      const session = await getSession();
      if (session?.user.authType === AuthType.SUMTOTAL) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/check-expiry?userId=${session.user.id}`);

        if (response.status >= 400 && response.status < 500) {
          console.log("Sign out");
          setNeedSignOut(true);
        }
      }
    } catch (error) {
      console.error("checkSumTotalTokenExpiration error", error);
    } finally {
      isCheckSumTotalTokenExpirationRef.current = false;
      // setLoading(false);
    }
  };

  useEffect(() => {
    checkSumTotalTokenExpiration();
  }, []);

  const processSignOut = async () => {
    startLoading();
    sessionStorage.clear();
    const signOutUrl = `${window.location.protocol}//${window.location.host}/${params.campaign_name}/${params.quizset_path}/login`;
    await signOut({
      redirect: false, // NextAuth의 기본 리디렉션을 방지
    });
    window.location.href = signOutUrl;
  };

  const routeNextQuizStage = async () => {
    startLoading();
    router.push("quiz");
  };

  return (
    <div
      className="flex flex-col items-center py-5 min-h-svh"
      style={{
        backgroundImage: `url('${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/common/images/bg_main2.jpg')`,
      }}
    >
      <EmailTestButton />
      <div className=" w-full flex flex-col pr-[21px] pl-[39px] relative z-20">
        <TutorialGuidePopup />
        <div className="flex flex-col font-bold">
          <span className="text-2xl">{translation("total_score")}</span>
          <span className="text-5xl/normal">{quizStagesTotalScore}</span>
        </div>
      </div>
      <div className="flex flex-col-reverse items-center justify-center mt-[120px] mb-[230px]">
        {quizSet.quizStages.map((quizStage: QuizStageEx, index: number) => (
          <Fragment key={quizStage.id}>
            <StageMarker
              ref={(item) => {
                itemsRef.current[index] = item;
              }}
              currentQuizStageIndex={currentQuizStageIndex}
              routeNextQuizStage={routeNextQuizStage}
              stage={quizStage}
              isCompleted={quizStageLogs.some((log) => log.quizStageId === quizStage.id)}
              startLoading={startLoading}
            />
            {quizStage.order !== quizSet.quizStages.length && <Connection />}
          </Fragment>
        ))}
      </div>

      <div className={cn("font-medium text-sm fixed z-30 bottom-7 flex justify-center items-start")}>
        <PolicyRenderer view="dialog" dialogType="privacy" domainCode={domainCode} />
        <span className="mx-2">|</span>
        <PolicyRenderer view="dialog" dialogType="term" domainCode={domainCode} />
      </div>
      <Gradient type="transparent-to-color" />
      <Gradient type="color-to-transparent" />

      {Loader()}

      <ResultAlertDialog
        open={!!needSignOut}
        description={translation("alert_relogin_required")}
        onConfirm={() => {
          stopLoading();
          processSignOut();
        }}
        confirmText={translation("ok")}
      />
    </div>
  );
}
