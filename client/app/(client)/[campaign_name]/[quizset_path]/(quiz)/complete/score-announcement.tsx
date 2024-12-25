import { useTranslations } from "next-intl";
import Stage from "./stage-complete";
import ScoreCircleAnimation from "./score-circle-animation";
import { cn } from "@/lib/utils";

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
      <Stage currentQuizStageIndex={currentQuizStageIndex}>
        <div className="text-[38px] my-[50px]">
          {translation("Completed.completed")}
        </div>
      </Stage>
      <ScoreCircleAnimation />
    </div>
  );
}
