"use client";
import { ErrorAlertDialog } from "@/app/components/quiz/alert-dialog";
import Qusetion from "@/app/components/quiz/question-area";
import Spinner from "@/app/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuiz } from "@/providers/quiz_provider";
import { usePathNavigator } from "@/route/usePathNavigator";
import { QuestionOption } from "@prisma/client";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { motion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// TODO:
// 1. review?stage=1 query를 통해 몇번째 stage를 보여줄건지 결정
// 2. 상단헤더: 문제이동(문제 뒤로가기, 앞으로 가기) | 몇번째 문제인지 | x버튼(route 'map')
// 3. 문제, 선택한 답변

export default function ReviewPage() {
  const { currentQuestionIndex, currentQuizStage, currentStageQuestions } = useQuiz();

  const { routeToPage } = usePathNavigator();
  const question = currentStageQuestions && currentStageQuestions[currentQuestionIndex];

  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const [loading, setLoading] = useState(false);

  const totalQuestions = currentStageQuestions?.length;
  const searchParams = useSearchParams();
  const search = searchParams.get("stage");

  // const next = async () => {
  //   setIsCorrectAnswer(false);

  //   if (canNextQuestion()) {
  //     setSelectedOptionIds([]);
  //     nextQuestion();
  //     window.scrollTo({ top: 0, behavior: "smooth" });

  //     return;
  //   }

  //   setLoading(true);

  //   setSelectedOptionIds([]);

  //   // nextStage();
  //   routeToPage("complete");
  // };

  useEffect(() => {
    if (!currentQuizStage || !currentStageQuestions) {
      setErrorMessage("퀴즈 스테이지를 찾을 수 없습니다.");
    }
  }, [currentQuizStage, currentStageQuestions]);

  return (
    <div className="min-h-svh bg-slate-300/20">
      <div className="sticky top-0 z-10">
        <div className={cn("bg-background p-5 grid grid-cols-12 gap-[2px]")}>
          <div className="col-span-4 content-center text-[12px] min-[400px]:text-[14px] text-nowrap font-extrabold">
            <Button size={"icon"} className="mr-4">
              <ArrowLeft />
            </Button>
            <Button size={"icon"}>
              <ArrowRight />
            </Button>
          </div>
          <div className="col-span-4 justify-items-center content-center">
            <motion.div
              className="bg-[#2686F5] rounded-[30px] w-[68px] text-white text-center flex justify-center gap-[2px]"
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, ease: "easeInOut", stiffness: 500 }}
            >
              <span>{currentQuestionIndex + 1}</span>
              <span>/</span>
              <span>{totalQuestions}</span>
            </motion.div>
          </div>
          <div className="col-span-4 flex self-center gap-1 justify-end">
            <Button size={"icon"} onClick={() => routeToPage("map")}>
              <X />
            </Button>
          </div>
        </div>
      </div>
      <Qusetion
        question={question.text}
        bgImageUrl={
          question.backgroundImageUrl
            ? `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${question.backgroundImageUrl}`
            : `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/bg_01.png`
        }
        charImageUrl={
          question.characterImageUrl
            ? `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${question.characterImageUrl}`
            : `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/character_m_01.png`
        }
      />
      <div className="pt-[30px] pb-[60px] px-5 flex flex-col gap-4 ">
        {question.options &&
          question.options.map((option: QuestionOption) => {
            return (
              <motion.label
                key={option.id}
                className={cn(
                  "rounded-[20px] py-4 px-6 bg-white hover:cursor-pointer",
                  selectedOptionIds.includes(option.id) && !option.isCorrect && "bg-[#EE3434] text-white pointer-events-none",
                  selectedOptionIds.includes(option.id) && option.isCorrect && "bg-[#2686F5] text-white pointer-events-none",
                  isCorrectAnswer && "pointer-events-none"
                )}
              >
                {option.text}({option.isCorrect ? "o" : "x"})
                <input
                  type="checkbox"
                  checked={selectedOptionIds.includes(option.id)}
                  readOnly
                  className="hidden"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                />
              </motion.label>
            );
          })}
      </div>
      <ErrorAlertDialog error={errorMessage} />
      {loading && <Spinner />}
    </div>
  );
}
