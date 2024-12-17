import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { LockIcon } from "../icons/icons";
import Image from "next/image";

interface StageProps {
  currentQuizStageIndex: number; // 풀어야 할 stage
  routeNextQuizStage: () => Promise<void>;
  stage: any;
}

export const Stage = forwardRef<HTMLDivElement, StageProps>((props, ref) => {
  const { routeNextQuizStage, currentQuizStageIndex, stage } = props;
  const stageOrder = stage.order;
  const isStageCompleted = currentQuizStageIndex >= stageOrder;
  const isActiveStage = currentQuizStageIndex + 1 === stageOrder;
  const badgeImageUrl = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${stage.badgeImageUrl}`;

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
          disabled={!isActiveStage || isStageCompleted}
          className={cn(
            "size-[80px] border-[10px] border-[#A6CFFF] box-content bg-[#666666] flex justify-center items-center rounded-full text-white hover:scale-105 transition-all disabled:hover:scale-100",
            isActiveStage && "size-[100px] bg-[#001276] border-[#0027EB]",
            isStageCompleted && "bg-[#001276]"
          )}
        >
          {stage.isBadgeStage ? (
            <Image
              alt="badge image"
              src={badgeImageUrl}
              width={200}
              height={200}
              className={cn(
                "object-cover w-full h-full ",
                !isActiveStage && !isStageCompleted && "grayscale"
              )}
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
