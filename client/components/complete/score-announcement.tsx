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
    <div className={cn(className, "flex flex-col items-center")}>
      <CompleteStage stageName={stageName}>
        <div className="text-4xl mt-[90px] mb-[60px]">
          {translation("completed")}
        </div>
      </CompleteStage>
      <ScoreCircleAnimation />
    </div>
  );
}
