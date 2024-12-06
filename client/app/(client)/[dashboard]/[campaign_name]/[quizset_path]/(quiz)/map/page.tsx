"use client";
import { cn } from "@/app/lib/utils";
import { QuizStageEx } from "@/app/types/type";
import { useQuiz } from "@/providers/quiz_provider";
import { usePathNavigator } from "@/route/usePathNavigator";
import InactiveBadge from "@/public/assets/badge_inactive.png";
import Image from "next/image";
import { Fragment } from "react";
import { QuestionMark } from "@/app/components/icons/icons";
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog";

const fixedClass = `fixed w-full max-w-[412px] left-1/2 -translate-x-1/2`;

export default function QuizMap() {
  const { quizSet, language, quizHistory } = useQuiz();
  const { routeToPage } = usePathNavigator();

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
              <DialogTitle>How to play Be a Galaxy AI Expert! (Paradigm)</DialogTitle>
            </DialogHeader>
            <div className="bg-[#EDEDED]">11</div>
            <DialogFooter>
              <Button variant={"primary"} onClick={() => console.log("TODO: 캐러샐이 넘어가야함. 끝났을땐 Dialog창 닫아야 함")}>
                OK
              </Button>
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
        {quizSet.quizStages.map((stage: QuizStageEx, index: number) => {
          const nextStage = (quizHistory?.lastCompletedStage ?? 0) + 1;
          const firstBadgeStage = quizHistory?.firstBadgeStage;

          return (
            <Fragment key={stage.id}>
              <Stage
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
      <div className="fixed z-30 bottom-7">Privacy | Term</div>
      <Gradient type="transparent-to-color" />
      <Gradient type="color-to-transparent" />
    </div>
  );
}

const Stage = ({
  nextStage,
  order,
  firstBadgeStage,
  routeNextQuizStage,
}: {
  nextStage: boolean;
  order: number;
  firstBadgeStage: number | null | undefined;
  routeNextQuizStage: () => Promise<void>;
}) => {
  // 완료하지 못한 stage에 자물쇠 아이콘
  // 완료한 stage는 색상 변경
  return (
    <div className="relative">
      <div className={cn("relative z-10")}>
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
};

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
