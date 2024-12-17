"use client";

import PrivacyAndTerm from "@/app/components/dialog/privacy-and-term";
import { QuestionMark } from "@/app/components/icons/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { QuizStageEx } from "@/app/types/type";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useQuiz } from "@/providers/quiz_provider";

import { usePathNavigator } from "@/route/usePathNavigator";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React, { Fragment, useEffect, useState } from "react";
import { fixedClass, cn } from "@/lib/utils";
import { Stage } from "@/app/components/map/stage";
import Gradient from "@/app/components/map/gradient";
import Connection from "@/app/components/map/connection";

export default function QuizMap() {
  const { quizSet, quizLog, quizStagesTotalScore, currentQuizStageIndex } =
    useQuiz();
  // console.log("✅quizSet", quizSet);
  console.log(currentQuizStageIndex);

  const [nextStage, setNextStage] = useState<number>(
    (quizLog?.lastCompletedStage ?? 0) + 1
  );

  const { routeToPage } = usePathNavigator();
  const t = useTranslations("Map_guide");

  // 아이템을 참조할 배열
  const itemsRef = React.useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setNextStage((quizLog?.lastCompletedStage ?? 0) + 1);
    const targetStage = itemsRef.current[nextStage - 1];
    // targetStage는 itemsRef[]의 인덱스가 0부터 시작하기 때문에 인덱스 값을 맞추기 위해 -1을 하였음

    if (targetStage) {
      targetStage.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [quizLog?.lastCompletedStage, nextStage, quizSet.quizStages]);

  const routeNextQuizStage = async () => {
    routeToPage("quiz");
  };

  {
    /* <div className="w-full bg-red-200">
        <h1>Quiz Map</h1>
        {language && <p>언어: {language.name}</p>}
        {quizSet && <p>퀴즈 스테이지 개수: {quizSet.quizStages.length}</p>}
        <p>다음 Stage: {(quizHistory?.lastCompletedStage ?? 0) + 1}</p>
        <button onClick={routeNextQuizStage}>Go Quiz</button>
      </div> */
  }

  return (
    <div
      className="flex flex-col items-center h-full "
      style={{
        backgroundImage: `url('/assets/bg_main2.png')`,
      }}
    >
      <div
        className={cn(
          fixedClass,
          "z-20 pt-[21px] pr-[21px] pl-[39px] flex flex-col"
        )}
      >
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
              <DialogTitle>{t("how_to_play")}</DialogTitle>
            </DialogHeader>
            {/* Carousel Area */}
            <TutorialCarousel />
            <DialogFooter>
              <DialogClose className="text-[18px] py-[22px] px-[34px]">
                OK
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="flex flex-col font-extrabold">
          <span className="text-[24px]">Total Score</span>
          <span className="text-[48px]">{quizStagesTotalScore}</span>
        </div>
      </div>

      {/* map compnent */}
      <div className="flex flex-col-reverse items-center justify-center my-[230px]">
        {quizSet.quizStages.map((stage: QuizStageEx, index) => {
          console.log("🚀", stage);
          return (
            <Fragment key={stage.id}>
              <Stage
                ref={(item) => {
                  itemsRef.current[index] = item;
                }}
                currentQuizStageIndex={currentQuizStageIndex}
                stageOrder={stage.order}
                routeNextQuizStage={routeNextQuizStage}
                isBadgeStage={stage.isBadgeStage}
              />
              {stage.order !== quizSet.quizStages.length && <Connection />}
            </Fragment>
          );
        })}
      </div>

      <PrivacyAndTerm />
      <Gradient type="transparent-to-color" />
      <Gradient type="color-to-transparent" />
    </div>
  );
}

const TutorialCarousel = () => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const t = useTranslations("Map_guide");

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const handleMoveIndex = () => {};

  return (
    <Carousel className="w-full" setApi={setApi}>
      <CarouselContent>
        {Array.from({ length: 3 }).map((_, index) => {
          return (
            <CarouselItem
              key={index}
              className={cn(current === index ? "w-full" : "w-0")}
            >
              <div className="p-1 h-full">
                {index === 0 && (
                  <div className="bg-[#EDEDED] max-h-[320px] h-full relative rounded-[20px] text-[#4E4E4E] p-4 py-5">
                    <p className="text-right absolute right-[62px] sm:right-[84px] top-[23px] sm:top-[21px] text-[12px] sm:text-[14px]">
                      {t("attempts_deduction")}
                    </p>
                    <div className="flex justify-center pt-[10px]">
                      <Image
                        src={"/assets/map_guide1.png"}
                        alt="map_guide1_image"
                        width={270}
                        height={160}
                      />
                    </div>
                    <p className="ml-[42px] sm:ml-[62px] -mt-[8px] sm:-mt-[10px] text-[12px] sm:text-[14px] text-pretty">
                      {t("time_limit_per_quiz")}
                    </p>
                  </div>
                )}
                {index === 1 && (
                  <Ol>
                    <li>{t("you_have_5_attemps")}</li>
                    <li>{t("giveup_or_interrupt_quiz")}</li>
                  </Ol>
                )}
                {index === 2 && (
                  <Ol>
                    <li>{t("answer_first_attempt")}</li>
                  </Ol>
                )}
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <div className="flex justify-center gap-2 mt-[10px]">
        {Array.from({ length: 3 }).map((_, index) => {
          return (
            <button
              onClick={handleMoveIndex}
              key={index}
              className={cn(
                "bg-black/30 size-2 text-white rounded-full",
                current === index && "bg-black/100"
              )}
            />
          );
        })}
      </div>
    </Carousel>
  );
};

const Ol = ({ children }: { children: React.ReactNode }) => {
  return (
    <ol className="bg-[#EDEDED] max-h-[320px] h-full rounded-[20px] pl-8 pr-4 py-5 list-disc text-[12px] sm:text-[14px] text-[#4E4E4E] flex flex-col gap-[26px]">
      {children}
    </ol>
  );
};
