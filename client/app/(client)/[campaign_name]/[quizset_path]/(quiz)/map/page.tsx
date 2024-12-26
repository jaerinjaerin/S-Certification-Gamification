"use client";
import PrivacyAndTerm from "@/app/components/dialog/privacy-and-term";
import { QuestionMark } from "@/app/components/icons/icons";

import Connection from "@/app/components/map/connection";
import Gradient from "@/app/components/map/gradient";
import { StageMarker } from "@/app/components/map/stage-marker";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QuizStageEx } from "@/app/types/type";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn, fixedClass } from "@/lib/utils";
import { useQuiz } from "@/providers/quiz_provider";
import { usePathNavigator } from "@/route/usePathNavigator";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React, { Fragment, useEffect, useState } from "react";
import { X } from "lucide-react";

export default function QuizMap() {
  const {
    quizSet,
    quizLog,
    quizStagesTotalScore,
    currentQuizStageIndex,
    quizStageLogs,
  } = useQuiz();
  // const [nextStage, setNextStage] = useState<number>(
  //   (quizLog?.lastCompletedStage ?? 0) + 1
  // );

  const { routeToPage } = usePathNavigator();
  const translation = useTranslations();

  // 아이템을 참조할 배열
  const itemsRef = React.useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // setNextStage((quizLog?.lastCompletedStage ?? 0) + 1);
    const targetStage = itemsRef.current[currentQuizStageIndex];

    if (!targetStage) return;

    targetStage.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [currentQuizStageIndex]);

  const routeNextQuizStage = async () => {
    routeToPage("/quiz");
  };

  return (
    <div
      className="flex flex-col items-center h-full min-h-svh"
      style={{
        backgroundImage: `url('${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/images/bg_main2.png')`,
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
              className="ml-auto border rounded-full border-black/50 [&_svg]:size-4"
              size={"icon_md"}
            >
              <QuestionMark />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{translation("Map_guide.how_to_play")}</DialogTitle>
            </DialogHeader>

            <TutorialCarousel />
            <DialogFooter>
              <DialogClose className="text-[18px] py-[22px] px-[34px]">
                <Button variant={"primary"}>
                  {translation("Login_popup.ok")}
                </Button>
                <DialogClose className="absolute top-5 right-5">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </DialogClose>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="flex flex-col font-extrabold">
          <span className="text-[24px]">{translation("Map.total_score")}</span>
          <span className="text-[48px]">{quizStagesTotalScore}</span>
        </div>
      </div>

      <div className="flex flex-col-reverse items-center justify-center my-[230px]">
        {quizSet.quizStages.map((quizStage: QuizStageEx, index: number) => {
          return (
            <Fragment key={quizStage.id}>
              <StageMarker
                ref={(item) => {
                  itemsRef.current[index] = item;
                }}
                currentQuizStageIndex={currentQuizStageIndex}
                routeNextQuizStage={routeNextQuizStage}
                stage={quizStage}
                isCompleted={quizStageLogs.some(
                  (log) => log.quizStageId === quizStage.id
                )}
              />
              {quizStage.order !== quizSet.quizStages.length && <Connection />}
            </Fragment>
          );
        })}
      </div>

      <PrivacyAndTerm className="fixed bottom-7 z-30" />
      <Gradient type="transparent-to-color" />
      <Gradient type="color-to-transparent" />
    </div>
  );
}

const TutorialCarousel = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const translation = useTranslations("Map_guide");

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const mapGuideImageUrl = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/images/map_guide.png`;

  return (
    <Carousel className="w-full" setApi={setApi}>
      <CarouselContent>
        {Array.from({ length: 2 }).map((_, index) => {
          return (
            <CarouselItem
              key={index}
              className={cn(current === index ? "w-full" : "w-0")}
            >
              <div className="h-full relative max-w-[300px]">
                {index === 0 && (
                  <div className="bg-[#EDEDED]  max-h-[320px] h-full overflow-y-scroll relative rounded-[20px] text-[#4E4E4E] p-4 py-5">
                    <p className="text-right absolute right-[62px] sm:right-[84px] top-[23px] sm:top-[21px] text-[12px] sm:text-[14px]">
                      {translation("attempts_deduction")}
                    </p>
                    <div className="flex justify-center pt-[10px]">
                      <Image
                        src={mapGuideImageUrl}
                        alt="map_guide1_image"
                        width={270}
                        height={160}
                      />
                    </div>
                    <p className="ml-[42px] sm:ml-[62px] -mt-[8px] sm:-mt-[10px] text-[12px] sm:text-[14px] text-pretty">
                      {translation("time_limit_per_quiz")}
                    </p>
                  </div>
                )}
                {index === 1 && (
                  <ol className="bg-[#EDEDED] max-h-[320px] overflow-y-scroll h-full rounded-[20px] pl-8 pr-4 py-5 list-disc text-[12px] sm:text-[14px] text-[#4E4E4E] flex flex-col gap-[26px]">
                    <li>{translation("you_have_5_attemps")}</li>
                    <li>{translation("giveup_or_interrupt_quiz")}</li>
                    <li>{translation("answer_first_attempt")}</li>
                  </ol>
                )}
                <div className="rounded-b-[20px] bottom-0 right-0 left-0 absolute bg-[#EDEDED] h-[18px]" />
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <div className="flex justify-center gap-2 mt-[10px]">
        {Array.from({ length: 2 }).map((_, index) => {
          return (
            <div
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
