import { BluePaperAirplaneIcon, QuestionMark } from "@/app/components/icons/icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useQuiz } from "@/providers/quiz_provider";
import { usePathNavigator } from "@/route/usePathNavigator";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function ScoreRankAnnouncement({ className }: { className?: string }) {
  const translation = useTranslations("Score_guide");
  const completed_translation = useTranslations("Completed");

  const { routeToPage } = usePathNavigator();
  const { quizStagesTotalScore, lastCompletedQuizStage, quizSet } = useQuiz();
  const isLastStage = quizSet.quizStages[quizSet.quizStages.length - 1].id === lastCompletedQuizStage!.id;

  const { data: session } = useSession();
  const user = session?.user;
  console.log(user);
  const scoreRankImageUrl = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/images/rank_graph.png`;

  return (
    <div className={cn("", className)}>
      <div className="w-full flex">
        <Dialog>
          <DialogTrigger asChild>
            <Button className={cn("ml-auto border rounded-full border-black/50 [&_svg]:size-4")} size={"icon_md"}>
              <QuestionMark />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{translation("score")}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 text-[14px] text-[#4E4E4E]">
              <div>
                <p className="font-extrabold">{translation("base_score")}</p>
                {translation("base_score_description")}
              </div>
              <div>
                <p className="font-extrabold">{translation("combo_score")}</p>
                {translation("combo_score_description")}
              </div>
              <div>
                <p className="font-extrabold">{translation("remaining_attempts")}</p>
                {translation("remaiing_attempts_description")}
              </div>
            </div>
            <DialogFooter>
              <DialogClose className="text-[18px] py-[22px] px-[34px]">
                <Button variant={"primary"}>{translation("ok")}</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* content */}
      <div>
        <h2 className="text-[32px]">{completed_translation("score")}</h2>
        <h1 className="text-[60px] ">{quizStagesTotalScore}</h1>
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

          <p className="text-[22px] text-balance px-5">{completed_translation("rank_notification")}</p>
        </div>

        {user?.provider !== "sumtotal" && <SendEmailCard />}

        <div className=" w-full space-x-0 sm:space-x-3">
          {user?.provider === "sumtotal" && (
            <Button className="text-[18px] mt-7" variant={"primary"}>
              S+
            </Button>
          )}
          <Button className="text-[18px] mt-7 " variant={"primary"} onClick={() => routeToPage("map")}>
            {isLastStage ? completed_translation("reture_map") : completed_translation("next_stage")}
          </Button>
        </div>
      </div>
    </div>
  );
}

const SendEmailCard = () => {
  const translation = useTranslations("Score_guide");

  return (
    <div className="pt-[10px]">
      <div className="flex rounded-[14px] gap-6 bg-[#CCECFF] py-4 px-[14px] items-center justify-center">
        <BluePaperAirplaneIcon className="shrink-0" />
        <p className="text-[#1429A0] text-[12px] sm:text-[14px] font-normal text-left max-w-[230px]">
          Your Galaxy AI expert badge will be sent to your email in 5 minutes
        </p>
      </div>
    </div>
  );
};
