import { BluePaperAirplaneIcon, QuestionMark } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { samsungplusAppDeepLink } from "@/core/config/links";
import { useQuiz } from "@/providers/quizProvider";
import { usePathNavigator } from "@/route/usePathNavigator";
import { cn } from "@/utils/utils";
import { AuthType } from "@prisma/client";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";

export default function ScoreRankAnnouncement({
  className,
}: {
  className?: string;
}) {
  const translation = useTranslations();

  const { routeToPage } = usePathNavigator();
  const {
    quizStagesTotalScore,
    lastCompletedQuizStage,
    quizSet,
    quizStageLogs,
  } = useQuiz();
  const isLastStage =
    quizSet.quizStages[quizSet.quizStages.length - 1].id ===
    lastCompletedQuizStage?.id;

  const { data: session } = useSession();
  const user = session?.user;

  const percentile = (quizStageLogs && quizStageLogs.at(-1)!.percentile) || 0;
  const topRank = 100 - percentile || 1;
  const getScoreRankGraphImageUrl = (topRank: number) => {
    if (topRank < 0 || topRank > 100) {
      throw new Error("Value must be between 0 and 100");
    }

    const GRAPH_NUMBER = Math.ceil(topRank / 10) * 10;
    return `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/images/rank_graph/graph=${GRAPH_NUMBER}.png`;
  };
  const locale = useLocale();
  const isArabic = locale === "ar-AE";

  return (
    <div className={cn("", className)}>
      <div className="w-full flex mb-[76px]">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              className={cn(
                "ml-auto border rounded-full border-black/50 [&_svg]:size-4"
              )}
              size={"icon_md"}
            >
              <QuestionMark />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{translation("score")}</DialogTitle>
            </DialogHeader>
            <div
              className={cn(
                "flex flex-col gap-4 text-sm text-[#4E4E4E] font-one font-medium",
                isArabic && "text-right"
              )}
            >
              <div>
                <p className="font-extrabold">{translation("base_score")}</p>
                {translation("base_score_description")}
              </div>
              <div>
                <p className="font-extrabold">{translation("combo_score")}</p>
                {translation("combo_score_description")}
              </div>
              <div>
                <p className="font-extrabold">
                  {translation("remaining_attempts")}
                </p>
                {translation("remaiing_attempts_description")}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant={"primary"}>{translation("ok")}</Button>
              </DialogClose>

              <DialogClose className="absolute top-5 right-5">
                <X />
                <span className="sr-only">Close</span>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* content */}
      <div className="mb-[38px]">
        <h2 className="text-4xl">{translation("score")}</h2>
        <h1 className="text-6xl/normal">{quizStagesTotalScore}</h1>
      </div>
      <div className="w-full">
        <div className="flex flex-col items-center gap-[32px] mb-[40px]">
          <div
            className="w-full h-[180px]"
            style={{
              backgroundImage: `url(${getScoreRankGraphImageUrl(topRank)})`,
              backgroundPosition: "center",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
            }}
          />

          <p className="px-5 text-2xl font-medium text-balance">
            {generateScoreRankText(translation("rank_notification"), topRank)}
          </p>
        </div>

        <SendBadgeNotificationCard
          message={
            user?.authType === AuthType.GUEST
              ? "이메일로 보냈습니다. 텍스트는 수정할 예정입니다."
              : translation("badge_deliver")
          }
        />

        <div className=" w-full flex flex-wrap justify-center gap-[10px] mt-[24px]">
          {user?.authType === AuthType.SUMTOTAL && (
            <Button
              variant={"primary"}
              onClick={() => {
                console.log("samsungplusAppDeepLink", samsungplusAppDeepLink);
                window.open(samsungplusAppDeepLink, "_blank");
              }}
            >
              S+
            </Button>
          )}
          <Button variant={"primary"} onClick={() => routeToPage("map")}>
            {isLastStage
              ? translation("return_map")
              : translation("next_stage")}
          </Button>
        </div>
      </div>
    </div>
  );
}

const SendBadgeNotificationCard = ({ message }: { message: string }) => {
  const locale = useLocale();
  const isArabic = locale === "ar-AE";
  return (
    <div className="pt-[10px]">
      <div
        className={cn(
          "flex rounded-[14px] gap-6 bg-[#CCECFF] py-4 px-[14px] items-center justify-center",
          isArabic && "flex-row-reverse"
        )}
      >
        <BluePaperAirplaneIcon className="shrink-0" />
        <p
          className={cn(
            "text-[#1429A0] text-sm font-medium text-left max-w-[230px] text-pretty",
            isArabic && "text-right"
          )}
        >
          {message}
        </p>
      </div>
    </div>
  );
};

const generateScoreRankText = (text: string, topRank: number) => {
  const splitText = text.split("XX");

  return (
    <>
      {splitText[0]}
      <span className="font-bold text-[#2686F5]">{topRank}</span>
      {splitText[1]}
    </>
  );
};
