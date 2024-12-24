"use client";
import { ErrorAlertDialog } from "@/app/components/quiz/alert-dialog";
import Qusetion from "@/app/components/quiz/question-area";
import Spinner from "@/app/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuiz } from "@/providers/quiz_provider";
import { QuestionOption } from "@prisma/client";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";

import { useEffect, useState } from "react";

export default function ReviewPage() {
  const { currentQuizStage, currentStageQuestions, quizQuestionLogs, quizSet } =
    useQuiz();

  // const { routeToPage } = usePathNavigator();
  const router = useRouter();

  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const searchStage = Number(searchParams.get("stage"));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const reviewQuizQuestionLogs = quizQuestionLogs.filter(
    (log) => log.quizStageIndex + 1 === searchStage
  );

  useEffect(() => {
    const currentReviewQuizQuestionLogs =
      reviewQuizQuestionLogs[currentQuestionIndex];
    setSelectedOptionIds([
      ...currentReviewQuizQuestionLogs.correctOptionIds,
      ...currentReviewQuizQuestionLogs.selectedOptionIds,
    ]);
  }, [currentQuestionIndex]);

  const questions = quizSet.quizStages.filter(
    (quiz) => quiz.order === searchStage
  )[0].questions;
  const question = questions[currentQuestionIndex];

  const next = () => {
    if (currentQuestionIndex === questions.length - 1) return;

    setSelectedOptionIds([]);
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  };

  const previous = () => {
    if (currentQuestionIndex === 0) return;
    setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  };

  useEffect(() => {
    if (!currentQuizStage || !currentStageQuestions) {
      setErrorMessage("퀴즈 스테이지를 찾을 수 없습니다.");
    }
  }, [currentQuizStage, currentStageQuestions]);

  return (
    <div className="min-h-svh bg-slate-200/20">
      <div className="sticky top-0 z-10">
        <div className="bg-white p-5 relative">
          {/* 양쪽  */}
          <div className="text-[12px] min-[400px]:text-[14px] text-nowrap font-extrabold absolute top-4">
            <Button
              size={"icon_md"}
              onClick={previous}
              disabled={currentQuestionIndex === 0}
              className="mr-4"
            >
              <ArrowLeft />
            </Button>
            <Button
              size={"icon_md"}
              onClick={next}
              disabled={currentQuestionIndex === questions.length - 1}
            >
              <ArrowRight />
            </Button>
          </div>
          <Button
            size={"icon_md"}
            onClick={() => router.push("map")}
            className="absolute right-5 top-4 "
          >
            <X />
          </Button>

          {/* 문항수 */}
          <div className="w-full">
            <motion.div
              className="bg-[#2686F5] rounded-[30px] w-[68px] text-white text-center flex justify-center gap-[2px] mx-auto"
              key={currentQuestionIndex}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, ease: "easeInOut", stiffness: 500 }}
            >
              <span>{currentQuestionIndex + 1}</span>
              <span>/</span>
              <span>{questions.length}</span>
            </motion.div>
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
          question.options.map((option: QuestionOption, index: number) => {
            return (
              <motion.label
                aria-readonly
                key={option.id}
                className={cn(
                  "rounded-[20px] py-4 px-6 bg-white hover:cursor-pointer",
                  selectedOptionIds.includes(option.id) &&
                    !option.isCorrect &&
                    "bg-[#EE3434] text-white pointer-events-none",
                  selectedOptionIds.includes(option.id) &&
                    option.isCorrect &&
                    "bg-[#2686F5] text-white pointer-events-none",
                  "pointer-events-none"
                )}
              >
                {option.text}({option.isCorrect ? "o" : "x"})
                <input
                  type="checkbox"
                  checked={selectedOptionIds.includes(option.id)}
                  readOnly
                  className="hidden"
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
