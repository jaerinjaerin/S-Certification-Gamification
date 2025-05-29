import { cn } from "@/utils/utils";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { forwardRef } from "react";
import { LockIcon } from "../icons/icons";
import { ActivePointer, Ping, WaveLoader } from "./animation-element";
import { QuizStageEx } from "@/types/apiTypes";

interface StageProps {
  currentQuizStageIndex: number;
  routeNextQuizStage: () => Promise<void>;
  stage: QuizStageEx;
  isCompleted: boolean;
  startLoading: () => void;
}

export const StageMarker = forwardRef<HTMLDivElement, StageProps>((props, ref) => {
  const { routeNextQuizStage, currentQuizStageIndex, stage, isCompleted, startLoading } = props;
  const router = useRouter();

  const badgeImageUrl = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${stage.badgeImage?.imagePath}`;

  const stageOrder = stage.order;
  const isActiveStage = currentQuizStageIndex + 1 === stageOrder;
  const isLocked = !isActiveStage && !isCompleted;
  const isInProgress = isActiveStage && !isCompleted;
  const isBadgeStage = stage.isBadgeStage && stage.badgeImage?.imagePath;

  const buttonStyles = cn(
    "size-[80px] border-[10px] border-[#A6CFFF] box-content bg-[#666666]",
    "flex justify-center items-center rounded-full text-white",
    "hover:scale-105 transition-all disabled:hover:scale-100",
    isActiveStage && "size-[100px] bg-[#001276] border-[#0027EB]",
    isCompleted && "bg-[#001276]"
  );

  const pulseAnimation = {
    initial: { scale: 1 },
    animate: (isInProgress: boolean) => ({
      scale: isInProgress ? [1, 1.1, 1, 1, 1] : 1,
    }),
    transition: {
      duration: 1.5,
      times: [0, 0.125, 0.5, 0.75, 1],
      ease: [0.4, 0, 0.2, 1],
      repeat: Infinity,
      repeatType: "loop",
      repeatDelay: 0.1,
    },
  } as const;

  const badgeStyles = cn("w-full h-full rounded-full", isLocked && "grayscale");

  const handleClickButton = async () => {
    if (isLocked) return;

    startLoading();
    isCompleted ? router.push(`review?stage=${stageOrder}`) : await routeNextQuizStage();
  };

  const Lock = () => {
    return (
      <div className="absolute right-[3px] -top-[14px] z-40 bg-white size-10 rounded-full flex justify-center items-center">
        <LockIcon />
      </div>
    );
  };

  const Badge = () => {
    return (
      <div
        className={badgeStyles}
        style={{
          backgroundImage: `url(${badgeImageUrl})`,
          backgroundPosition: "center",
          backgroundSize: "contain",
        }}
      />
    );
  };
  const Stage = () => {
    return `stage ${stageOrder}`;
  };

  return (
    <div className="relative" ref={ref}>
      <div className={cn("relative z-10")}>
        {isLocked && <Lock />}

        <motion.button
          onClick={handleClickButton}
          disabled={isLocked}
          className={buttonStyles}
          initial={pulseAnimation.initial}
          animate={pulseAnimation.animate(isInProgress)}
          transition={pulseAnimation.transition}
        >
          {isBadgeStage ? <Badge /> : <Stage />}
        </motion.button>

        {isInProgress && <ActivePointer />}
      </div>

      {isInProgress && <WaveLoader />}
    </div>
  );
});

StageMarker.displayName = "StageMarker";
