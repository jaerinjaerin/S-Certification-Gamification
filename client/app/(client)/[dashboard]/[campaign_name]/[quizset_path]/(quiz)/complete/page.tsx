"use client";

import {
  BluePaperAirplaneIcon,
  QuestionMark,
  SPlusIcon,
} from "@/app/components/icons/icons";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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
import { sleep } from "@/app/lib/utils";
import { animate, motion, useInView } from "motion/react";

export default function QuizComplete() {
  const { quizStageLogs, currentQuizStageIndex, quizSet } = useQuiz();

  const { routeToPage } = usePathNavigator();
  const currentStage = quizSet.quizStages.find(
    (stage) => stage.order === currentQuizStageIndex
  );
  const isBadgeStage = currentStage.isBadgeStage;

  useEffect(() => {
    const routeToMapPage = async () => {
      await sleep(3000);
      routeToPage("map");
    };

    if (!quizStageLogs.at(-1)) {
      return;
    }

    routeToMapPage();
  }, [quizStageLogs]);

  return (
    <div
      className="flex flex-col items-center h-full "
      style={{
        backgroundImage: `url('/assets/bg_main2.png')`,
      }}
    >
      <div>
        <div className="flex flex-col w-full items-center text-center gap-[46px] mx-auto pt-[60px] px-[9px] font-extrabold">
          {isBadgeStage ? (
            <GetBadgeAnnouncment
              completedStage={currentQuizStageIndex}
              badgeStage={currentStage}
            />
          ) : (
            <ScoreAnnouncement completedStage={currentQuizStageIndex} />
          )}
        </div>
      </div>
    </div>
  );
}

const ScoreAnnouncement = ({ completedStage }: { completedStage: number }) => {
  const t = useTranslations("Completed");
  const { quizStageLogs, getAllStageMaxScore, quizStagesTotalScore } =
    useQuiz();

  const stageScore = quizStageLogs.at(-1)?.score ?? 0;
  const CIRCLE_PERCENTAGE = Math.floor(
    (quizStagesTotalScore / getAllStageMaxScore()) * 100
  );
  const ANIMATION_DURATION = 1;
  const targetDasharray = `${CIRCLE_PERCENTAGE} ${100 - CIRCLE_PERCENTAGE}`;

  console.log(
    "quizStagesTotalScore: ",
    quizStagesTotalScore,
    "getAllStageMaxScore: ",
    getAllStageMaxScore(),
    "percentage: ",
    CIRCLE_PERCENTAGE
  );

  return (
    <>
      <div>
        <h2 className="text-2xl">{t("stage")}</h2>
        <h1 className="text-[50px]">{completedStage}</h1>
      </div>
      <div>
        <h1 className="mt-[26px] mb-[66px] text-[38px]">{t("completed")}</h1>
        <div className="relative">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 400 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="200"
              cy="200"
              r={150}
              stroke="lightgray"
              strokeWidth="20"
              fill="none"
            />
            <motion.circle
              cx="0"
              cy="200"
              r={150}
              stroke="black"
              strokeWidth="20"
              fill="none"
              pathLength="100"
              strokeDasharray="0 100"
              animate={{
                strokeDasharray: targetDasharray,
              }}
              transform="rotate(-90 100 100)"
              transition={{
                duration: `${ANIMATION_DURATION}`,
                ease: "easeInOut",
              }}
            />
          </svg>

          <div className="pt-[15px] absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
            <p className="text-xl">{t("score")}</p>
            <Stat stageScore={stageScore} />
          </div>
        </div>
      </div>
    </>
  );
};

const GetBadgeAnnouncment = ({
  completedStage,
  badgeStage,
}: {
  completedStage: number;
  badgeStage: any;
}) => {
  const t = useTranslations("Completed");
  const [done, setDone] = useState(false);

  const badgeImageUrl = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/${badgeStage.badgeImageUrl}`;

  return (
    <>
      <div>
        <h2 className="text-2xl">{t("stage")}</h2>
        <h1 className="text-[50px]">{completedStage}</h1>
      </div>
      <div className="flex flex-col items-center gap-10">
        <h3 className="text-[22px] text-pretty">{t("congratulation")}</h3>
        <Image src={badgeImageUrl} alt="badge image" width={200} height={200} />
        <Button
          className="text-[18px] mt-[26px]"
          variant={"primary"}
          onClick={() => setDone(true)}
        >
          {t("done")}
        </Button>
      </div>
      {done && <ScoreRanked />}
    </>
  );
};

const ScoreRanked = () => {
  // TODO: 나중에 다른 내용으로 교체, 임시로 만들어둔 state
  const [isCardOpen, setIsCardOpen] = useState(true);
  const t = useTranslations("Score_guide");
  const { quizStageLogs } = useQuiz();
  const { routeToPage } = usePathNavigator();

  const stageScore = quizStageLogs.at(-1)?.score ?? 0;

  return (
    <>
      <div className="absolute top-[21px] right-[21px]">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              className={cn("ml-auto border rounded-full border-black/50")}
              size={"icon_md"}
            >
              <QuestionMark />
            </Button>
          </DialogTrigger>
          <DialogContent dismissOnOverlayClick>
            <DialogHeader>
              <DialogTitle>{t("score")}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 text-[14px] text-[#4E4E4E]">
              <div>
                <p className="font-extrabold">{t("base_score")}</p>
                {t("base_score_discription")}
              </div>
              <div>
                <p className="font-extrabold">{t("combo_score")}</p>
                {t("combo_score_description")}
              </div>
              <div>
                <p className="font-extrabold">{t("remaining_attempts")}</p>
                {t("remaiing_attempts_description")}
              </div>
            </div>
            <DialogFooter>
              <DialogClose className="text-[18px] py-[22px] px-[34px]">
                {t("ok")}
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* content */}
      <div>
        <h2 className="text-[32px]">Your Score</h2>
        <h1 className="text-[60px]">{stageScore}</h1>
      </div>
      <div className="w-full">
        <div className="flex flex-col items-center gap-[29px] mb-7">
          <Image
            src={"/assets/rank_graph.png"}
            alt="rank graph"
            width={320}
            height={179}
          />
          <p className="text-[22px] text-balance px-5">
            {t("rank_notification")}
          </p>
        </div>
        {isCardOpen ? (
          <>
            <SendEmailCard />
            <Button
              className="text-[18px] mt-7"
              variant={"primary"}
              onClick={() => routeToPage("map")}
            >
              {t("reture_map")}
            </Button>
          </>
        ) : (
          <div className="gap-[10px] flex justify-center">
            <Button className="text-[18px] mt-7" variant={"primary"}>
              <SPlusIcon />
            </Button>
            <Button
              className="text-[18px] mt-7"
              variant={"primary"}
              onClick={() => routeToPage("map")}
            >
              {t("reture_map")}
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

const SendEmailCard = () => {
  const t = useTranslations("Score_guide");

  return (
    <div className="pt-[10px]">
      <div className="flex rounded-[14px] gap-6 bg-[#CCECFF] py-4 px-[14px] items-center justify-center">
        <BluePaperAirplaneIcon className="shrink-0" />
        <p className="text-[#1429A0] text-[12px] sm:text-[14px] font-normal text-left max-w-[230px]">
          {t("badge_deliver")}
        </p>
      </div>
    </div>
  );
};

const Stat = ({ stageScore }: { stageScore: number }) => {
  const ref = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(ref);

  useEffect(() => {
    if (!isInView) return;

    animate(0, stageScore, {
      duration: 1,
      onUpdate(value) {
        if (!ref.current) return;
        ref.current.textContent = value.toFixed(0);
      },
    });
  }, [stageScore, isInView]);

  return (
    <h1 className="text-[50px] leading-normal" ref={ref}>
      {stageScore}
    </h1>
  );
};
