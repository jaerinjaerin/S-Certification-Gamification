import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Stage from "./stage-complete";

export default function GetBadgeAnnouncment({
  stageName,
  badgeStage,
  className,
}: {
  stageName: string;
  badgeStage: any;
  className?: string;
}) {
  const translation = useTranslations("Completed");
  const badgeImageUrl = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${badgeStage.badgeImageUrl}`;

  return (
    <div className={cn("w-full shrink-0", className)}>
      <div className="flex flex-col gap-[10px] justify-center">
        <Stage stageName={stageName}>
          <div className="text-[22px] text-pretty my-[30px]">
            {translation("congratulation")}
          </div>
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
