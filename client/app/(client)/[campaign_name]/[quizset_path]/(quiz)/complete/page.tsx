"use client";
import Stat from "@/app/components/complete/stat";
import {
  BluePaperAirplaneIcon,
  QuestionMark,
} from "@/app/components/icons/icons";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn, sleep } from "@/lib/utils";
import { useQuiz } from "@/providers/quiz_provider";
import { usePathNavigator } from "@/route/usePathNavigator";
import { motion } from "motion/react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useInterval } from "usehooks-ts";

export default function QuizComplete() {
  const { quizStageLogs, lastCompletedQuizStage } = useQuiz();

  const { routeToPage } = usePathNavigator();
  const isBadgeStage = lastCompletedQuizStage?.isBadgeStage ?? false;

  useEffect(() => {
    const routeToMapPage = async () => {
      await sleep(3000);
      routeToPage("map");
    };

    if (!quizStageLogs.at(-1)) return;
    if (isBadgeStage) return;

    routeToMapPage();
  }, [quizStageLogs]);

  return (
    <div className="flex flex-col items-center h-svh overflow-x-hidden">
      <div className="flex w-full items-center text-center gap-[46px] py-[30px] mx-auto px-[9px] font-extrabold h-full flex-1">
        <SwipeCarousel />
        {/* <ScoreAnnouncement stageName={currentQuizStageIndex} />
        <GetBadgeAnnouncment
          stageName={currentQuizStageIndex}
          badgeStage={currentStage}
        />
        <ScoreRankAnnouncement /> */}
      </div>
    </div>
  );
}

const ScoreAnnouncement = ({ stageName }: { stageName: string }) => {
  const translation = useTranslations("Completed");
  const { getAllStageMaxScore, quizStagesTotalScore } = useQuiz();

  // const stageScore = quizStageLogs.at(-1)?.score ?? 0;
  const CIRCLE_PERCENTAGE = Math.floor(
    (quizStagesTotalScore / getAllStageMaxScore()) * 100
  );
  const ANIMATION_DURATION = 1;
  const targetDasharray = `${CIRCLE_PERCENTAGE} ${100 - CIRCLE_PERCENTAGE}`;

  // console.log(
  //   "quizStagesTotalScore: ",
  //   quizStagesTotalScore,
  //   "getAllStageMaxScore: ",
  //   getAllStageMaxScore(),
  //   "percentage: ",
  //   CIRCLE_PERCENTAGE
  // );

  return (
    <div className="w-full shrink-0">
      <div>
        <h2 className="text-2xl">{translation("stage")}</h2>
        <h1 className="text-[50px]">{stageName}</h1>
      </div>
      <div>
        <h1 className="mt-[26px] mb-[66px] text-[38px]">
          {translation("completed")}
        </h1>
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
            <p className="text-xl">{translation("score")}</p>
            <Stat score={quizStagesTotalScore} />
          </div>
        </div>
      </div>
    </div>
  );
};

const GetBadgeAnnouncment = ({
  stageName,
  badgeStage,
}: {
  stageName: string;
  badgeStage: any;
}) => {
  const translation = useTranslations("Completed");

  const badgeImageUrl = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${badgeStage.badgeImageUrl}`;

  return (
    <div className="w-full shrink-0">
      <motion.div
        key="not-done"
        className="flex flex-col gap-[10px] justify-center"
      >
        <div className="flex flex-col items-center">
          <h2 className="text-2xl">{translation("stage")}</h2>
          <h1 className="text-[50px]">{stageName}</h1>
        </div>
        <div className="flex flex-col items-center gap-10">
          <h3 className="text-[22px] text-pretty">
            {translation("congratulation")}
          </h3>
          <Image
            src={badgeImageUrl}
            alt="badge image"
            width={200}
            height={200}
          />
        </div>
      </motion.div>
    </div>
  );
};

const ScoreRankAnnouncement = () => {
  // S+ 사용자인 경우와 미사용자인 경우 나눠야 함
  // S+ 사용자는 s+버튼, returnmap버튼
  // s+ 미사용자는 메일전송노티, returnmap 버튼

  // 마지막 스테이지인지 나눠야 함
  // 사용자는 N
  const translation = useTranslations("Score_guide");
  const { routeToPage } = usePathNavigator();
  const { quizStagesTotalScore, lastCompletedQuizStage, quizSet } = useQuiz();
  const isLastStage = !lastCompletedQuizStage
    ? false
    : quizSet.quizStages[quizSet.quizStages.length - 1].id ===
      lastCompletedQuizStage.id;
  const { data: session } = useSession();
  const user = session?.user;
  const scoreRankImageUrl = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/images/rank_graph.png`;

  return (
    <div className="w-full shrink-0">
      <div className="w-full flex">
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
              <DialogTitle>{translation("score")}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 text-[14px] text-[#4E4E4E]">
              <div>
                <p className="font-extrabold">{translation("base_score")}</p>
                {translation("base_score_discription")}
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
              <DialogClose className="text-[18px] py-[22px] px-[34px]">
                {translation("ok")}
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* content */}
      <div>
        <h2 className="text-[32px]">Your Score</h2>
        <h1 className="text-[60px]">{quizStagesTotalScore}</h1>
      </div>
      <div className="w-full">
        <div className="flex flex-col items-center gap-[29px] mb-7">
          <Image
            src={scoreRankImageUrl}
            alt="rank graph"
            width={320}
            height={179}
          />
          <p className="text-[22px] text-balance px-5">
            {/* {translation("rank_notification")} */}
            You are ranked in the top 20%
          </p>
        </div>

        {user?.provider !== "sumtotal" && <SendEmailCard />}

        <div className="flex justify-center gap-3">
          {user?.provider === "sumtotal" && (
            <Button
              className="text-[18px] mt-7"
              variant={"primary"}
              // onClick={() => routeToPage("map")}
            >
              S+
            </Button>
          )}
          <Button
            className="text-[18px] mt-7 "
            variant={"primary"}
            onClick={() => routeToPage("map")}
          >
            {/* {translation("reture_map")} */}
            {isLastStage ? "Return map" : "Next Stage"}
          </Button>
        </div>
      </div>
    </div>
  );
};

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

const ONE_SECOND = 3000;
const AUTO_DELAY = ONE_SECOND;

const SPRING_OPTIONS = {
  type: "spring",
  mass: 3,
  stiffness: 400,
  damping: 50,
};

const SwipeCarousel = () => {
  const { lastCompletedQuizStage } = useQuiz();
  const isBadgeStage = lastCompletedQuizStage?.isBadgeStage ?? false;
  console.log("🚧isBadgeStage", isBadgeStage);
  const [imgIndex, setImgIndex] = useState(0);
  const carouselIndex = isBadgeStage ? 2 : 0;

  const handleIndex = () => {
    setImgIndex((pv) => {
      return pv + 1;
    });
  };

  useInterval(handleIndex, imgIndex === carouselIndex ? null : AUTO_DELAY);

  return (
    <>
      <div className="relative overflow-hidden py-8 w-full">
        <motion.div
          animate={{
            translateX: `-${imgIndex * 100}%`,
          }}
          transition={SPRING_OPTIONS}
          className="flex items-center"
        >
          <motion.div
            transition={SPRING_OPTIONS}
            className="w-full aspect-video shrink-0 rounded-xl object-cover"
          >
            <ScoreAnnouncement stageName={lastCompletedQuizStage?.name ?? ""} />
          </motion.div>

          {isBadgeStage && (
            <motion.div
              transition={SPRING_OPTIONS}
              className="w-full aspect-video shrink-0 rounded-xl object-cover"
            >
              <GetBadgeAnnouncment
                stageName={lastCompletedQuizStage?.name ?? ""}
                badgeStage={lastCompletedQuizStage}
              />
            </motion.div>
          )}
          {isBadgeStage && (
            <motion.div
              transition={SPRING_OPTIONS}
              className="w-full aspect-video shrink-0 rounded-xl object-cover"
            >
              <ScoreRankAnnouncement />
            </motion.div>
          )}
        </motion.div>
      </div>
    </>
  );
};
