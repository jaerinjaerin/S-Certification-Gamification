import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import Stage from "./stage-complete";

export default function GetBadgeAnnouncment({
  currentQuizStageIndex,
  badgeStage,
  className,
}: {
  currentQuizStageIndex: number;
  badgeStage: any;
  className?: string;
}) {
  const translation = useTranslations("Completed");
  const badgeImageUrl = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${badgeStage.badgeImageUrl}`;

  return (
    <div className={cn("w-full shrink-0", className)}>
      <div className="flex flex-col gap-[10px] justify-center">
        <Stage currentQuizStageIndex={currentQuizStageIndex}>
          <div className="text-[22px] text-pretty my-[30px]">{translation("congratulation")}</div>
        </Stage>
        <div
          className="size-[200px] mx-auto"
          style={{
            backgroundImage: `url(${badgeImageUrl})`,
            backgroundPosition: "center",
            backgroundSize: "contain",
          }}
        />
      </div>
    </div>
  );
}
