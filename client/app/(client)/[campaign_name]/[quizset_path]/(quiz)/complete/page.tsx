"use client";

import { sleep } from "@/lib/utils";
import { useQuiz } from "@/providers/quiz_provider";
import { usePathNavigator } from "@/route/usePathNavigator";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useInterval } from "usehooks-ts";
import GetBadgeAnnouncment from "./get-badge-announcement";
import ScoreAnnouncement from "./score-announcement";
import ScoreRankAnnouncement from "./score-rank-announcement";

export default function QuizComplete() {
  const { quizStageLogs, lastCompletedQuizStage, currentQuizStageIndex } = useQuiz();

  const { routeToPage } = usePathNavigator();
  const isBadgeStage = lastCompletedQuizStage?.isBadgeStage ?? false;

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
      routeToPage("map");
    };

    if (!quizStageLogs.at(-1)) return;
    if (isBadgeStage) return;

    routeToMapPage();
  }, [quizStageLogs]);

  useInterval(handleIndex, switchlIndex === carouselIndex ? null : switchlIndex === 1 ? 4_000 : AUTO_DELAY);

  return (
    <div className="min-h-svh overflow-x-hidden">
      <motion.div
        className="flex w-full h-full items-center text-center py-[20px] font-extrabold"
        animate={{
          translateX: `-${switchlIndex * 100}%`,
        }}
      >
        <ScoreAnnouncement currentQuizStageIndex={currentQuizStageIndex} className="w-full h-full shrink-0" />

        {isBadgeStage && (
          <>
            <GetBadgeAnnouncment
              currentQuizStageIndex={currentQuizStageIndex}
              badgeStage={lastCompletedQuizStage}
              className="w-full h-full shrink-0"
            />
            <ScoreRankAnnouncement className="w-full h-full shrink-0" />
          </>
        )}
      </motion.div>
    </div>
  );
}
