"use client";
import React, { forwardRef, LegacyRef, useEffect, useState } from "react";
import { cn } from "@/app/lib/utils";
import { QuizStageEx } from "@/app/types/type";
import { useQuiz } from "@/providers/quiz_provider";
import { usePathNavigator } from "@/route/usePathNavigator";
import InactiveBadge from "@/public/assets/badge_inactive.png";
import Image from "next/image";
import { Fragment } from "react";
import { LockIcon, QuestionMark } from "@/app/components/icons/icons";
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog";
import { Carousel, CarouselItem, CarouselContent } from "@/components/ui/carousel";
import PrivacyAndTerm from "@/app/components/dialog/privacy-and-term";
import { type CarouselApi } from "@/components/ui/carousel";
import { useTranslations } from "next-intl";

const fixedClass = `fixed w-full max-w-[412px] left-1/2 -translate-x-1/2`;

export default function QuizMap() {
  const [nextStage, setNextStage] = useState(0);
  const { quizSet, language, quizHistory } = useQuiz();
  const { routeToPage } = usePathNavigator();
  const t = useTranslations("Map_guide");

  // 아이템을 참조할 배열
  const itemsRef = React.useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setNextStage((quizHistory?.lastCompletedStage ?? 0) + 1);

    const activeStage =
      quizSet.quizStages.findIndex((stage) => {
        // console.log("stage.order", stage.order); // order가 1부터 시작
        return stage.order === nextStage;
      }) + 1; // 해당하는 인덱스값을 반환하기 때문에 +1을 하여 현재 스테이지 값과 동일하도록 함

    // console.log(itemsRef.current[activeStage]);
    if (activeStage !== -1 && itemsRef.current[activeStage]) {
      itemsRef.current[activeStage].scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [quizHistory?.lastCompletedStage, nextStage, quizSet.quizStages]);

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
      <div className={cn(fixedClass, "z-20 pt-[21px] pr-[21px] pl-[39px] flex flex-col")}>
        <Dialog>
          <DialogTrigger asChild>
            <Button className={cn("ml-auto border rounded-full border-black/50")} size={"icon_md"}>
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
              {/* <Button variant={"primary"} onClick={() => console.log("TODO: 캐러샐이 넘어가야함. 끝났을땐 Dialog창 닫아야 함")}>
                OK
              </Button> */}
              <DialogClose className="text-[18px] py-[22px] px-[34px]">OK</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="flex flex-col font-extrabold">
          <span className="text-[24px]">Total Score</span>
          <span className="text-[48px]">470</span>
        </div>
      </div>

      {/* map compnent */}
      <div className="flex flex-col-reverse items-center justify-center my-[230px]">
        {quizSet.quizStages.map((stage: QuizStageEx, index) => {
          const firstBadgeStage = quizHistory?.firstBadgeStage;

          return (
            <Fragment key={stage.id}>
              <Stage
                ref={(item) => {
                  itemsRef.current[index] = item;
                }}
                nextStage={stage.order === nextStage}
                order={stage.order}
                firstBadgeStage={firstBadgeStage}
                routeNextQuizStage={routeNextQuizStage}
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

interface StageProps {
  nextStage: boolean;
  order: number;
  firstBadgeStage: number | null | undefined;
  routeNextQuizStage: () => Promise<void>;
}

const Stage = forwardRef<HTMLDivElement, StageProps>((props, ref) => {
  const { nextStage, order, firstBadgeStage, routeNextQuizStage } = props;
  // 완료하지 못한 stage에 자물쇠 아이콘
  // 완료한 stage는 색상 변경
  return (
    <div className="relative" ref={ref}>
      <div className={cn("relative z-10")}>
        {!nextStage && (
          <div className="absolute right-[3px] -top-[14px] bg-white size-10 rounded-full flex justify-center items-center">
            <LockIcon />
          </div>
        )}

        <button
          onClick={routeNextQuizStage}
          disabled={!nextStage}
          className={cn(
            "size-[80px] border-[10px] border-[#A6CFFF] box-content bg-[#666666] flex justify-center items-center rounded-full text-white hover:scale-105 transition-all disabled:hover:scale-100",
            nextStage && "size-[100px] bg-[#001276] border-[#0027EB]"
          )}
        >
          {firstBadgeStage === order ? <Image src={InactiveBadge} alt="inactive-badge" className="object-cover w-full h-full" /> : `stage ${order}`}
        </button>

        {nextStage && (
          <span className="absolute bottom-[-30px] right-[-28px] size-[85px] " style={{ backgroundImage: `url('/assets/pointer.svg')` }} />
        )}
      </div>
      {nextStage && <div className="absolute z-0 -inset-4 bg-[#80B5FF80]/50 rounded-full animate-pulse" />}
      {nextStage && <div className="absolute z-0 -inset-6 bg-[#5AAFFF4D]/30 rounded-full animate-pulse" />}
    </div>
  );
});

Stage.displayName = "Stage";

const Connection = () => {
  return <div className="w-[31px] h-[140px] bg-[#A6CFFF] scale-[1.1]" />;
};

// 색 -> 투명으로 이어지는 그라데이션
// 투명 -> 색으로 이어지는 그라데이션
type GradientType = "color-to-transparent" | "transparent-to-color";
const Gradient = ({ type }: { type: GradientType }) => {
  return (
    <div
      className={cn(
        "h-[220px] z-10 from-white/0 to-white",
        fixedClass,
        type === "color-to-transparent" ? "bg-gradient-to-t top-0 " : "bg-gradient-to-b bottom-0"
      )}
    />
  );
};

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
            <CarouselItem key={index} className={cn(current === index ? "w-full" : "w-0")}>
              <div className="p-1">
                {index === 0 && (
                  <div className="bg-[#EDEDED] min-h-[340px] relative rounded-[20px] text-[#4E4E4E] p-4 py-5">
                    <p className="text-right absolute right-[62px] sm:right-[84px] top-[23px] sm:top-[21px] text-[12px] sm:text-[14px]">
                      {t("attempts_deduction")}
                    </p>
                    <div className="flex justify-center pt-[10px]">
                      <Image src={"/assets/map_guide1.png"} alt="map_guide1_image" width={270} height={160} />
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
              className={cn("bg-black/30 size-2 text-white rounded-full", current === index && "bg-black/100")}
            />
          );
        })}
      </div>
      {/* <CarouselPrevious />
      <CarouselNext /> */}
    </Carousel>
  );
};

const Ol = ({ children }: { children: React.ReactNode }) => {
  return (
    <ol className="bg-[#EDEDED] min-h-[340px] rounded-[20px] pl-8 pr-4 py-5 list-disc text-[12px] sm:text-[14px] text-[#4E4E4E] flex flex-col gap-[26px]">
      {children}
    </ol>
  );
};

// TODO: QuizHistory
// badgeAcquisitionDate: null;
// campaignDomainQuizSetId: "df4d9601-463e-4d66-b429-7d4af00d23f9";
// campaignId: "7f434785-82e2-4309-b263-f2531c414951";
// createdAt: "2024-12-05T07:33:26.478Z";
// domainId: "8f7d1646-7742-462c-b7e1-a413cfe5a828";
// firstBadgeActivityId: "test_optional_activity_id";
// firstBadgeStage: 3;
// id: "fa319477-624b-4616-9b9b-454e0f7c4b07";
// isBadgeAcquired: false;
// isCompleted: false;
// isFirstBadgeStageCompleted: false;
// jobId: "cfee5fb9-5183-482c-9185-0f00e1e3d2b8";
// languageId: "e92508c5-4621-4ffe-b5cf-98b4e9c9c5d3";
// lastBadgeActivityId: "test_main_activity_id";
// lastCompletedStage: null; //🔥 내가 완료한 스테이지 단계
// timeSpent: null;
// updatedAt: "2024-12-05T07:33:26.478Z";
// userId: "f2629b21-559d-444f-8e50-4ef6d8131ca2";

// ========================================================================
// quizsetPath us_fsm_en
// result: {
//   id: 'df4d9601-463e-4d66-b429-7d4af00d23f9',
//   path: 'us_fsm_en',
//   campaignId: '7f434785-82e2-4309-b263-f2531c414951',
//   domainId: '8f7d1646-7742-462c-b7e1-a413cfe5a828',
//   jobId: 'cfee5fb9-5183-482c-9185-0f00e1e3d2b8',
//   languageId: 'e92508c5-4621-4ffe-b5cf-98b4e9c9c5d3',
//   firstBadgeStage: 3,
//   firstBadgeActivityId: 'test_optional_activity_id',
//   lastBadgeActivityId: 'test_main_activity_id',
//   createrId: 'admin',
//   updaterId: null,
//   createdAt: 2024-12-05T00:23:43.089Z,
//   updatedAt: 2024-12-05T00:23:43.089Z,
//   language: {
//     id: 'e92508c5-4621-4ffe-b5cf-98b4e9c9c5d3',
//     code: 'en',
//     name: 'English'
//   },
//   campaign: {
//     id: '7f434785-82e2-4309-b263-f2531c414951',
//     name: 'S24',
//     description: 'A campaign spanning multiple languages',
//     createdAt: 2024-12-05T00:23:41.521Z,
//     updatedAt: 2024-12-05T00:23:41.521Z,
//     startedAt: 2024-12-05T00:23:41.514Z,
//     endedAt: 2025-01-05T00:23:41.514Z,
//     createrId: 'admin',
//     updaterId: null
//   },
//   domain: {
//     id: '8f7d1646-7742-462c-b7e1-a413cfe5a828',
//     name: 'US',
//     code: 'us',
//     createdAt: 2024-12-05T00:23:41.465Z,
//     updatedAt: 2024-12-05T00:23:41.465Z,
//     channelSegmentIds: 'b6426fb4-357b-4872-9ec0-d0ed371952d5,e625aa0c-a763-42b0-a0dc-abf5f021236e,344fabd2-9f64-4416-85d3-e2452b8c5535'
//   },
//   quizStages: [
//     {
//       id: 'de320be3-b79d-48db-b97c-2bc4ff1ab224',
//       name: 'Stage 1 for US',
//       order: 1,
//       questionIds: '["a9e8ea5c-dbd9-43e3-ac6a-702928f827d9","af101e2d-3df6-4404-99e1-c2f54d872da6","95f37a1a-bcea-482f-9315-fca2abaf1566"]',
//       lifeCount: 3,
//       campaignDomainQuizSetId: 'df4d9601-463e-4d66-b429-7d4af00d23f9',
//       createdAt: 2024-12-05T00:23:43.105Z,
//       updatedAt: 2024-12-05T00:23:43.105Z
//     },
//     {
//       id: 'a44693ff-09da-4199-870a-ecf941d89e26',
//       name: 'Stage 2 for US',
//       order: 2,
//       questionIds: '["32d81fb8-c500-4ac1-954b-682252788111","4353d465-8d4b-40e6-bed3-7a4ec6d9819f","a9e8ea5c-dbd9-43e3-ac6a-702928f827d9"]',
//       lifeCount: 3,
//       campaignDomainQuizSetId: 'df4d9601-463e-4d66-b429-7d4af00d23f9',
//       createdAt: 2024-12-05T00:23:43.112Z,
//       updatedAt: 2024-12-05T00:23:43.112Z
//     },
//     {
//       id: 'bc2397cc-509b-4d45-acfa-6d4f4388fddc',
//       name: 'Stage 3 for US',
//       order: 3,
//       questionIds: '["a9e8ea5c-dbd9-43e3-ac6a-702928f827d9","4353d465-8d4b-40e6-bed3-7a4ec6d9819f","af101e2d-3df6-4404-99e1-c2f54d872da6"]',
//       lifeCount: 3,
//       campaignDomainQuizSetId: 'df4d9601-463e-4d66-b429-7d4af00d23f9',
//       createdAt: 2024-12-05T00:23:43.120Z,
//       updatedAt: 2024-12-05T00:23:43.120Z
//     },
//     {
//       id: '34848ad5-0e62-45a2-8f20-feca6552a69c',
//       name: 'Stage 4 for US',
//       order: 4,
//       questionIds: '["fdc74105-b247-4fe0-a821-aef9a2442e42","95f37a1a-bcea-482f-9315-fca2abaf1566","32d81fb8-c500-4ac1-954b-682252788111"]',
//       lifeCount: 3,
//       campaignDomainQuizSetId: 'df4d9601-463e-4d66-b429-7d4af00d23f9',
//       createdAt: 2024-12-05T00:23:43.127Z,
//       updatedAt: 2024-12-05T00:23:43.127Z
//     }
//   ]
// }
