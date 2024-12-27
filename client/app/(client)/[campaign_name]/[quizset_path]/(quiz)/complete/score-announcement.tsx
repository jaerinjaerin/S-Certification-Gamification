import { useTranslations } from "next-intl";

import ScoreCircleAnimation from "./score-circle-animation";
import { cn } from "@/lib/utils";
import CompleteStage from "./stage-complete";

export default function ScoreAnnouncement({
  currentQuizStageIndex,
  className,
}: {
  currentQuizStageIndex: number;
  className?: string;
}) {
  const translation = useTranslations();

  return (
    <div className={cn(className)}>
      <CompleteStage currentQuizStageIndex={currentQuizStageIndex}>
        <div className="text-[38px] my-[50px]">{translation("completed")}</div>
      </CompleteStage>
      <ScoreCircleAnimation />
    </div>
  );
}
