"use client";

import { BluePaperAirplaneIcon, QuestionMark, SPlusIcon } from "@/app/components/icons/icons";
import { Button } from "@/app/components/ui/button";
import { cn, fixedClass } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog";
import { useQuiz } from "@/providers/quiz_provider";

export default function QuizComplete() {
  const { quizLog } = useQuiz();

  // 완료한 스테이지 체크하는 변수
  const completedStage = quizLog?.lastCompletedStage ?? 0;

  return (
    <div
      className="flex flex-col items-center h-full "
      style={{
        backgroundImage: `url('/assets/bg_main2.png')`,
      }}
    >
      <div className={cn(fixedClass, "z-20 p-[21px] flex flex-col relative")}>
        <div className="flex flex-col w-full items-center text-center gap-[66px] mx-auto pt-[60px] px-[9px] font-extrabold">
          <ScoreAnimation completedStage={completedStage} score={quizLog?.score} />
          {/* <GetBadge completedStage={completedStage} /> */}
          {/* <ScoreRanked /> */}
        </div>
      </div>
    </div>
  );
}

const ScoreAnimation = ({ completedStage, score }: { completedStage: number; score: number | null | undefined }) => {
  const translation = useTranslations("Completed");
  return (
    <>
      <div>
        <h2 className="text-2xl mb-[26px]">{translation("stage")}</h2>
        <h1 className="text-[50px]">{completedStage}</h1>
      </div>
      <div>
        <h1 className="mt-[26px] mb-[66px] text-[38px]">{translation("completed")}</h1>
        <div className="relative">
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M100 188C148.601 188 188 148.601 188 100C188 51.3989 148.601 12 100 12C51.3989 12 12 51.3989 12 100C12 148.601 51.3989 188 100 188ZM100 200C155.228 200 200 155.228 200 100C200 44.7715 155.228 0 100 0C44.7715 0 0 44.7715 0 100C0 155.228 44.7715 200 100 200Z"
              fill="black"
            />
          </svg>

          <div className="pt-[15px] absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
            <p className="text-xl">{translation("score")}</p>
            <h1 className="text-[50px] leading-normal">{score ?? 0}</h1>
          </div>
        </div>
      </div>
    </>
  );
};

const GetBadge = ({ completedStage }: { completedStage: number }) => {
  const translation = useTranslations("Completed");
  return (
    <>
      <div>
        <h2 className="text-2xl mb-[26px]">{translation("stage")}</h2>
        <h1 className="text-[50px]">{completedStage}</h1>
      </div>
      <div className="flex flex-col items-center gap-10">
        <h3 className="text-[22px] text-pretty">{translation("congratulation")}</h3>
        <Image src={"/assets/badge_all_models.png"} alt="green badge with all models" width={200} height={200} />
        <Button className="text-[18px] mt-[26px]" variant={"primary"}>
          {translation("done")}
        </Button>
      </div>
    </>
  );
};

const ScoreRanked = () => {
  // TODO: 나중에 다른 내용으로 교체, 임시로 만들어둔 state
  const [isCardOpen, setIsCardOpen] = useState(true);
  const translation = useTranslations("Score_guide");

  const contentData = ["base_score", "combo_score", "remaining_attempts"];

  return (
    <>
      <div className="absolute top-[21px] right-[21px]">
        <Dialog>
          <DialogTrigger asChild>
            <Button className={cn("ml-auto border rounded-full border-black/50")} size={"icon_md"}>
              <QuestionMark />
            </Button>
          </DialogTrigger>
          <DialogContent dismissOnOverlayClick>
            <DialogHeader>
              <DialogTitle>{translation("score")}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 text-[14px] text-[#4E4E4E]">
              {/* {contentData.map((item, index) => {
              return (
                <div key={index}>
                  <p className="font-extrabold">{t(item)}</p>
                  {t(`${item}_description`)}
                </div>
              );
            })} */}
              <div>
                <p className="font-extrabold">{translation("base_score")}</p>
                {translation("base_score_discription")}
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
              <DialogClose className="text-[18px] py-[22px] px-[34px]">{translation("ok")}</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* content */}
      <div>
        <h2 className="text-[32px]">Your Score</h2>
        <h1 className="text-[60px]">840</h1>
      </div>
      <div className="w-full">
        <div className="flex flex-col items-center gap-[29px] mb-7">
          <Image src={"/assets/rank_graph.png"} alt="rank graph" width={320} height={179} />
          <p className="text-[22px] text-balance px-5">{translation("rank_notification")}</p>
        </div>
        {isCardOpen ? (
          <>
            <SendEmailCard />
            <Button className="text-[18px] mt-7" variant={"primary"}>
              {translation("reture_map")}
            </Button>
          </>
        ) : (
          <div className="gap-[10px] flex justify-center">
            <Button className="text-[18px] mt-7" variant={"primary"}>
              <SPlusIcon />
            </Button>
            <Button className="text-[18px] mt-7" variant={"primary"}>
              {translation("reture_map")}
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

const SendEmailCard = () => {
  const translation = useTranslations("Score_guide");

  return (
    <div className="pt-[10px]">
      <div className="flex rounded-[14px] gap-6 bg-[#CCECFF] py-4 px-[14px] items-center justify-center">
        <BluePaperAirplaneIcon className="shrink-0" />
        <p className="text-[#1429A0] text-[12px] sm:text-[14px] font-normal text-left max-w-[230px]">{translation("badge_deliver")}</p>
      </div>
    </div>
  );
};
