import { cn } from "@/utils/utils";
import { useTranslations } from "next-intl";
import CompleteStage from "./stage-complete";
import useCheckLocale from "@/hooks/useCheckLocale";

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
  const { isMyanmar } = useCheckLocale();
  const badgeImageUrl = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${badgeStage.badgeImage?.imagePath}`;
  const congratulationMessage =
    stageName === "3"
      ? translation("congratulation_1")
      : translation("congratulation_2");

  return (
    <div className={cn("w-full shrink-0", className)}>
      <div className="flex flex-col gap-[10px] justify-center">
        <CompleteStage stageName={stageName}>
          <div
            className={cn(
              "text-2xl text-pretty mt-[66px] mb-[40px] text-center",
              isMyanmar && "leading-loose"
            )}
          >
            <span className="block whitespace-break-spaces">
              {congratulationMessage.replaceAll("!", "! \n")}
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
