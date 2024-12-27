import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import ScoreCircleAnimation from "./score-circle-animation";
import Stage from "./stage-complete";

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
      <Stage stageName={stageName}>
        <div className="text-[38px] my-[50px]">
          {translation("Completed.completed")}
        </div>
      </Stage>
      <ScoreCircleAnimation />
    </div>
  );
}
