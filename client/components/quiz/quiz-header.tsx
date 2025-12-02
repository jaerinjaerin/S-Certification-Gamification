import { motion } from "motion/react";
import { cn } from "@/utils/utils";
import CountDownBar from "./countdown-bar";
import { AnimatedHeartIcon } from "./animations";

type QuizHeaderProps = {
  currentQuestionIndex: number;
  currentStageTotalQuestions: number;
  defaultLifeCount: number;
  lifeCount: number;
  remainingTimeProgress: number;
  isWindows: boolean;
  isAndroid: boolean;
  translation: (key: string) => string;
};

const QUESTION_ANIMATION_PROPS = {
  initial: { scale: 1 },
  animate: { scale: [1, 1.2, 1] },
  transition: {
    duration: 0.5,
    ease: "easeInOut",
    stiffness: 500,
  },
};

export function QuizHeader({
  currentQuestionIndex,
  currentStageTotalQuestions,
  defaultLifeCount,
  lifeCount,
  remainingTimeProgress,
  isWindows,
  isAndroid,
  translation,
}: QuizHeaderProps) {
  return (
    <div className="sticky top-0 z-10">
      <div className="p-5 h-[70px] flex items-center gap-[10px] bg-white">
        <div className="justify-start flex-1 min-w-0 text-xs min-[300px]:text-sm text-pretty">{translation("galaxy_ai_expert")}</div>
        {/* quiz 현재 상태 */}
        <div className="flex-none">
          <motion.div
            {...QUESTION_ANIMATION_PROPS}
            key={`quiz-header-question-${currentQuestionIndex}`}
            className={cn(
              "bg-[#2686F5] rounded-[30px] w-[68px] text-white text-center flex justify-center gap-[2px] font-medium text-sm py-1",
              (isWindows || isAndroid) && "*:translate-y-[1px]"
            )}
          >
            <span key="current">{currentQuestionIndex + 1}</span>
            <span key="separator">/</span>
            <span key="total">{currentStageTotalQuestions}</span>
          </motion.div>
        </div>
        {/* 하트 */}
        <div className="flex justify-end flex-1 min-w-0 gap-1">
          <AnimatedHeartIcon defaultLifeCount={defaultLifeCount} lifeCount={lifeCount} />
        </div>
      </div>
      <CountDownBar progress={remainingTimeProgress} />
    </div>
  );
}
