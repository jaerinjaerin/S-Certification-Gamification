import Stat from "@/app/components/complete/stat";
import { useQuiz } from "@/providers/quiz_provider";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

export default function ScoreCircleAnimation() {
  const { getAllStageMaxScore, quizStagesTotalScore } = useQuiz();
  const translation = useTranslations();

  const CIRCLE_PERCENTAGE = Math.floor(
    (quizStagesTotalScore / getAllStageMaxScore()) * 100
  );
  const ANIMATION_DURATION = 1;
  const targetDasharray = `${CIRCLE_PERCENTAGE} ${100 - CIRCLE_PERCENTAGE}`;

  return (
    <div>
      <div className="relative flex justify-center">
        <svg
          width="220px"
          height="220px"
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="200"
            cy="200"
            r={150}
            stroke="lightgray"
            strokeWidth="20"
            fill="none"
          />
          <motion.circle
            cx="0"
            cy="200"
            r={150}
            stroke="black"
            strokeWidth="20"
            fill="none"
            pathLength="100"
            strokeDasharray="0 100"
            animate={{
              strokeDasharray: targetDasharray,
            }}
            transform="rotate(-90 100 100)"
            transition={{
              duration: `${ANIMATION_DURATION}`,
              ease: "easeInOut",
            }}
          />
        </svg>

        <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
          <p className="text-xl">{translation("score")}</p>
          <Stat score={quizStagesTotalScore} />
        </div>
      </div>
    </div>
  );
}
