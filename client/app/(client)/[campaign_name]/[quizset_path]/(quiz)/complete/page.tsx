"use client";
import GetBadgeAnnouncment from "@/components/complete/get-badge-announcement";
import ScoreAnnouncement from "@/components/complete/score-announcement";
import ScoreRankAnnouncement from "@/components/complete/score-rank-announcement";
import useGAPageView from "@/core/monitoring/ga/usePageView";
import { useCampaign } from "@/providers/campaignProvider";
import { useQuiz } from "@/providers/quizProvider";
import { sleep } from "@/utils/utils";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useInterval } from "usehooks-ts";

export default function QuizComplete() {
  useGAPageView();
  const router = useRouter();
  const { quizStageLogs, lastCompletedQuizStage } = useQuiz();
  const { campaign } = useCampaign();
  const translation = useTranslations();

  const isOldCampaign = campaign.slug.toLowerCase() === "s25";
  const isBadgeStage = lastCompletedQuizStage?.isBadgeStage ?? false;

  const congratulationMessage = (): string => {
    if (!isBadgeStage) {
      return "";
    }

    if (isOldCampaign) {
      if (lastCompletedQuizStage?.name === "3") {
        return translation("congratulation_1");
      } else if (lastCompletedQuizStage?.name === "4") {
        return translation("congratulation_2");
      }
    } else {
      if (isBadgeStage) {
        return lastCompletedQuizStage?.badgeType === "FIRST"
          ? translation("congratulation_1")
          : translation("congratulation_2");
      }
    }
    return "";
  };

  const [switchlIndex, setSwitchIndex] = useState(0);
  const carouselIndex = isBadgeStage ? 2 : 0;
  const AUTO_DELAY = 3_000;

  const handleIndex = () => {
    setSwitchIndex((pv) => {
      return pv + 1;
    });
  };

  useEffect(() => {
    const routeToMapPage = async () => {
      await sleep(3000);
      console.log("퀴즈 완료 페이지에서 맵 페이지로 이동");
      router.push("map");
    };

    if (!quizStageLogs.at(-1)) return;
    if (isBadgeStage) return;
    routeToMapPage();
  }, [quizStageLogs]);

  useInterval(
    handleIndex,
    switchlIndex === carouselIndex
      ? null
      : switchlIndex === 1
      ? 4_000
      : AUTO_DELAY
  );

  return (
    <div className="px-9">
      <div className="overflow-x-hidden min-h-svh">
        <motion.div
          className="flex w-full min-h-svh text-center py-[21px] font-bold "
          animate={{
            translateX: `-${switchlIndex * 100}%`,
          }}
        >
          <ScoreAnnouncement
            stageName={lastCompletedQuizStage?.name ?? ""}
            className="w-full h-full shrink-0"
          />

          {isBadgeStage && (
            <>
              <GetBadgeAnnouncment
                congratulationMessage={congratulationMessage()}
                stageName={lastCompletedQuizStage?.name ?? ""}
                badgeStage={lastCompletedQuizStage}
                className="w-full h-full shrink-0"
              />
              <ScoreRankAnnouncement className="w-full h-full shrink-0" />
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
