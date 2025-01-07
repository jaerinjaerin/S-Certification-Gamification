import {
  BluePaperAirplaneIcon,
  QuestionMark,
} from "@/app/components/icons/icons";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { useQuiz } from "@/providers/quiz_provider";
import { usePathNavigator } from "@/route/usePathNavigator";
import { cn } from "@/utils/utils";
import { AuthType } from "@prisma/client";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

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
  const scoreRankImageUrl = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/images/rank_graph.png`;
  const percentile = (quizStageLogs && quizStageLogs.at(-1)!.percentile) || 0;
  const topRank = 100 - percentile || 1;

  return (
    <div className={cn("", className)}>
      <div className="w-full flex">
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
            <div className="flex flex-col gap-4 text-[14px] text-[#4E4E4E] font-one font-medium">
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
              <DialogClose className="text-[18px] py-[22px] px-[34px]" asChild>
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
      <div>
        <h2 className="text-[32px]">{translation("score")}</h2>
        <h1 className="text-[60px] my-9">{quizStagesTotalScore}</h1>
      </div>
      <div className="w-full">
        <div className="flex flex-col items-center gap-[25px] mb-7">
          <div
            className="w-full h-[180px]"
            style={{
              backgroundImage: `url(${scoreRankImageUrl})`,
              backgroundPosition: "center",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
            }}
          />

          <p className="text-[22px] text-balance px-5">
            {translation("rank_notification").replace("XX", String(topRank))}
          </p>
        </div>

        {user?.authType !== AuthType.SUMTOTAL && <SendEmailCard />}

        <div className=" w-full space-x-0 sm:space-x-3">
          {user?.authType === AuthType.SUMTOTAL && (
            <Button className="text-[18px] mt-7" variant={"primary"}>
              S+
            </Button>
          )}
          <Button
            className="text-[18px] mt-7 "
            variant={"primary"}
            onClick={() => routeToPage("map")}
          >
            {isLastStage
              ? translation("return_map")
              : translation("next_stage")}
          </Button>
        </div>
      </div>
    </div>
  );
}

const SendEmailCard = () => {
  const translation = useTranslations();

  return (
    <div className="pt-[10px]">
      <div className="flex rounded-[14px] gap-6 bg-[#CCECFF] py-4 px-[14px] items-center justify-center">
        <BluePaperAirplaneIcon className="shrink-0" />
        <p className="text-[#1429A0] text-[12px] sm:text-[14px] font-normal text-left max-w-[230px]">
          {translation("badge_deliver")}
        </p>
      </div>
    </div>
  );
};
