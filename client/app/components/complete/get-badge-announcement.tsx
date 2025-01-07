import { cn } from "@/utils/utils";
import { useTranslations } from "next-intl";
import CompleteStage from "./stage-complete";

export default function GetBadgeAnnouncment({
  stageName,
  badgeStage,
  className,
}: {
  stageName: string;
  badgeStage: any;
  className?: string;
}) {
  const translation = useTranslations();
  const badgeImageUrl = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${badgeStage.badgeImageUrl}`;

  return (
    <div className={cn("w-full shrink-0", className)}>
      <div className="flex flex-col gap-[10px] justify-center">
        <CompleteStage stageName={stageName}>
          <div className="text-[22px] text-pretty my-[30px] text-center">
            <span className="block">
              {stageName === "3"
                ? translation("congratulation 1")
                : translation("congratulation 2")}
            </span>
          </div>
        </CompleteStage>
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
