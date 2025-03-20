"use client";
import PolicyFooter from "@/components/dialog/privacy-and-term";
import Connection from "@/components/map/connection";
import Gradient from "@/components/map/gradient";
import { StageMarker } from "@/components/map/stage-marker";
import TutorialGuidePopup from "@/components/map/tutorial-guide-popup";
import useLoader from "@/components/ui/loader";
import useGAPageView from "@/core/monitoring/ga/usePageView";
import { useQuiz } from "@/providers/quizProvider";
import { QuizStageEx } from "@/types/apiTypes";
import { cn, fixedClass } from "@/utils/utils";
import { AuthType } from "@prisma/client";
import { getSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useRef } from "react";

export default function QuizMap({
  params,
}: {
  params: { campaign_name: string; quizset_path: string };
}) {
  // //
  useGAPageView();
  const {
    quizSet,
    quizStagesTotalScore,
    currentQuizStageIndex,
    quizStageLogs,
  } = useQuiz();
  const translation = useTranslations();
  const { loading, setLoading, renderLoader } = useLoader();
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    const targetStage = itemsRef.current[currentQuizStageIndex];

    if (!targetStage) return;

    targetStage.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [currentQuizStageIndex]);

  const checkSumTotalTokenExpiration = async () => {
    const session = await getSession();
    console.log(
      "session",
      session,
      session?.user.authType === AuthType.SUMTOTAL
    );
    if (session?.user.authType === AuthType.SUMTOTAL) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/check-expiry?userId=${session.user.id}`
      );

      console.log("response", response);

      if (response.status >= 400 && response.status < 500) {
        console.log("Sign out");
        await signOut({
          redirect: true,

          callbackUrl: `/${params.campaign_name}/${params.quizset_path}/login`,
        });
      }
    }
  };

  useEffect(() => {
    checkSumTotalTokenExpiration();
  }, []);

  const routeNextQuizStage = async () => {
    setLoading(true);
    router.push("quiz");
  };

  return (
    <div
      className="flex flex-col items-center h-full min-h-svh"
      style={{
        backgroundImage: `url('${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/common/images/bg_main2.jpg')`,
      }}
    >
      <div
        className={cn(
          fixedClass,
          "z-20 pt-[21px] pr-[21px] pl-[39px] flex flex-col"
        )}
      >
        <TutorialGuidePopup />
        <div className="flex flex-col font-bold">
          <span className="text-2xl">{translation("total_score")}</span>
          <span className="text-5xl/normal">{quizStagesTotalScore}</span>
        </div>
      </div>
      <div className="flex flex-col-reverse items-center justify-center my-[230px]">
        {quizSet.quizStages.map((quizStage: QuizStageEx, index: number) => {
          return (
            <Fragment key={quizStage.id}>
              <StageMarker
                ref={(item) => {
                  itemsRef.current[index] = item;
                }}
                currentQuizStageIndex={currentQuizStageIndex}
                routeNextQuizStage={routeNextQuizStage}
                stage={quizStage}
                // isCompleted={index < currentQuizStageIndex}
                isCompleted={quizStageLogs.some(
                  (log) => log.quizStageId === quizStage.id
                )}
                setLoading={setLoading}
              />
              {quizStage.order !== quizSet.quizStages.length && <Connection />}
            </Fragment>
          );
        })}
      </div>
      <PolicyFooter className="fixed z-30 bottom-7 flex justify-center items-start" />
      <Gradient type="transparent-to-color" />
      <Gradient type="color-to-transparent" />
      {loading && renderLoader()}
    </div>
  );
}
