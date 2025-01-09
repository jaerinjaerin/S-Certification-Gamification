import { cn } from "@/utils/utils";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { forwardRef } from "react";
import { LockIcon } from "../icons/icons";
import { ActivePointer, Ping } from "./animation-element";

interface StageProps {
  currentQuizStageIndex: number;
  routeNextQuizStage: () => Promise<void>;
  stage: any;
  isCompleted: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const StageMarker = forwardRef<HTMLDivElement, StageProps>(
  (props, ref) => {
    const {
      routeNextQuizStage,
      currentQuizStageIndex,
      stage,
      isCompleted,
      setLoading,
    } = props;
    const router = useRouter();
    const stageOrder = stage.order;
    const isActiveStage = currentQuizStageIndex + 1 === stageOrder;
    const badgeImageUrl = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${stage.badgeImageUrl}`;

    const renderLockIcon = () =>
      !isActiveStage &&
      !isCompleted && (
        <div className="absolute right-[3px] -top-[14px] z-40 bg-white size-10 rounded-full flex justify-center items-center">
          <LockIcon />
        </div>
      );

    const renderButtonContent = () => {
      if (stage.isBadgeStage && stage.badgeImageUrl) {
        return (
          <div
            className={cn(
              "w-full h-full",
              !isActiveStage && !isCompleted && "grayscale"
            )}
            style={{
              backgroundImage: `url(${badgeImageUrl})`,
              backgroundPosition: "center",
              backgroundSize: "contain",
            }}
          />
        );
      }
      return `stage ${stageOrder}`;
    };

    return (
      <div className="relative" ref={ref}>
        <div className={cn("relative z-10")}>
          {renderLockIcon()}

          <motion.button
            onClick={() => {
              if (isCompleted) {
                setLoading(true);
                router.push(`review?stage=${stageOrder}`);
                return;
              }
              routeNextQuizStage();
            }}
            disabled={!isActiveStage && !isCompleted}
            className={cn(
              "size-[80px] border-[10px] border-[#A6CFFF] box-content bg-[#666666] flex justify-center items-center rounded-full text-white hover:scale-105 transition-all disabled:hover:scale-100",
              isActiveStage && "size-[100px] bg-[#001276] border-[#0027EB]",
              isCompleted && "bg-[#001276]"
            )}
          >
            {renderButtonContent()}
          </motion.button>

          {isActiveStage && !isCompleted && <ActivePointer />}
        </div>

        {isActiveStage && !isCompleted && <Ping />}
      </div>
    );
  }
);

StageMarker.displayName = "StageMarker";
