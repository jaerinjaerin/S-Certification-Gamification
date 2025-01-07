import { cn } from "@/utils/utils";
import { useTranslations } from "next-intl";
import ScoreCircleAnimation from "./score-circle-animation";
import CompleteStage from "./stage-complete";

export default function ScoreAnnouncement({
  stageName,
  className,
}: {
  stageName: string;
  className?: string;
}) {
  const translation = useTranslations();

  return (
    <div className={cn(className)}>
      <CompleteStage stageName={stageName}>
        <div className="text-[38px] my-[50px]">{translation("completed")}</div>
      </CompleteStage>
      <ScoreCircleAnimation />
    </div>
  );
}
