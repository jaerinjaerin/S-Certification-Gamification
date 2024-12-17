import { cn } from "@/lib/utils";
import { useQuiz } from "@/providers/quiz_provider";
import { forwardRef } from "react";
import { LockIcon } from "../icons/icons";
import Image from "next/image";
import InactiveBadge from "@/public/assets/badge_inactive.png";

interface StageProps {
  currentQuizStageIndex: number; // 풀어야 할 stage
  stageOrder: number;
  isBadgeStage: boolean;
  routeNextQuizStage: () => Promise<void>;
}

export const Stage = forwardRef<HTMLDivElement, StageProps>((props, ref) => {
  const {
    stageOrder,
    routeNextQuizStage,
    currentQuizStageIndex,
    isBadgeStage,
  } = props;
  const isStageCompleted = currentQuizStageIndex > stageOrder; // TODO: ActiveStage와 order 비교
  const isActiveStage = currentQuizStageIndex === stageOrder;
  console.log(isActiveStage, "🏃🏻‍♀️");
  const { isCompleted } = useQuiz();

  return (
    <div className="relative" ref={ref}>
      <div className={cn("relative z-10")}>
        {!isActiveStage && !isStageCompleted && (
          <div className="absolute right-[3px] -top-[14px] z-40 bg-white size-10 rounded-full flex justify-center items-center">
            <LockIcon />
          </div>
        )}

        <button
          onClick={routeNextQuizStage}
          disabled={!isActiveStage || isCompleted}
          className={cn(
            "size-[80px] border-[10px] border-[#A6CFFF] box-content bg-[#666666] flex justify-center items-center rounded-full text-white hover:scale-105 transition-all disabled:hover:scale-100",
            isActiveStage && "size-[100px] bg-[#001276] border-[#0027EB]",
            isCompleted && "bg-[#001276]"
          )}
        >
          {isBadgeStage ? (
            <Image
              src={InactiveBadge} // TODO: isBadgeStage? ActiveBadge: InactiveBadge
              alt="inactive-badge"
              className="object-cover w-full h-full"
            />
          ) : (
            `stage ${stageOrder}`
          )}
        </button>

        {isActiveStage && <ActivePointer />}
      </div>

      {isActiveStage && <ActiveGradient />}
    </div>
  );
});

Stage.displayName = "Stage";

const ActivePointer = () => {
  return (
    <span
      className="absolute bottom-[-30px] right-[-28px] size-[85px] "
      style={{ backgroundImage: `url('/assets/pointer.svg')` }}
    />
  );
};

const ActiveGradient = () => {
  return (
    <>
      <div className="absolute z-0 -inset-4 bg-[#80B5FF80]/50 rounded-full animate-pulse" />
      <div className="absolute z-0 -inset-6 bg-[#5AAFFF4D]/30 rounded-full animate-pulse" />
    </>
  );
};
