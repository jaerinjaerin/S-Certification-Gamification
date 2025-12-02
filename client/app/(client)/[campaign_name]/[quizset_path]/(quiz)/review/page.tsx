"use client";

// React
import { useEffect, useState } from "react";

// Next
import { useRouter, useSearchParams } from "next/navigation";

// Third party
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { QuestionOption, UserQuizQuestionLog } from "@prisma/client";

// Components
import { Button } from "@/components/ui/button";
import Qusetion from "@/components/quiz/question-area";
import useLoader from "@/components/ui/loader";

// Constants
import { arabicDomains } from "@/core/config/default";

// Hooks
import useGAPageView from "@/core/monitoring/ga/usePageView";
import { useQuizQuestionLogs } from "@/hooks/api/log/useQuizQuestionLogs";
import useCheckLocale from "@/hooks/useCheckLocale";

// Providers
import { useCampaign } from "@/providers/campaignProvider";
import { useQuiz } from "@/providers/quizProvider";

// Utils
import { cn, getCampaignSlug } from "@/utils/utils";

export default function ReviewPage() {
  useGAPageView();

  // Hooks
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId, quizSet } = useQuiz();
  const { campaign } = useCampaign();
  const { isArabic } = useCheckLocale();
  const { Loader } = useLoader();

  // States
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Derived states
  const searchStage = Number(searchParams.get("stage"));
  const isArabicCountry = arabicDomains.includes(getCampaignSlug(campaign));
  const isArabicLocale = campaign.name.toLowerCase() === "s25" ? isArabic : isArabicCountry;
  const questions = quizSet.quizStages.filter((quiz) => quiz.order === searchStage)[0].questions;
  const question = questions[currentQuestionIndex];

  // API states
  const { data: quizQuestionLogs, loading: logsLoading, error } = useQuizQuestionLogs(userId, quizSet.id, searchStage - 1);

  useEffect(() => {
    const reviewQuizQuestionLog: UserQuizQuestionLog | undefined = quizQuestionLogs?.find((log) => log.questionId === question.id);

    const correctOptionIds = question.options.filter((option) => option.isCorrect).map((option) => option.id);

    if (!reviewQuizQuestionLog) {
      setSelectedOptionIds([...correctOptionIds, ...correctOptionIds]);
    } else {
      setSelectedOptionIds([...correctOptionIds, ...reviewQuizQuestionLog.selectedOptionIds]);
    }
  }, [error, quizQuestionLogs, currentQuestionIndex]);

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

  return (
    <div className="min-h-svh bg-slate-200/20">
      <div className="sticky top-0 z-10">
        <div className="relative p-5 bg-white">
          {/* 양쪽  */}
          <div className="text-[12px] min-[400px]:text-[14px] text-nowrap font-extrabold absolute top-4">
            <Button size={"icon_md"} onClick={previous} disabled={currentQuestionIndex === 0} className="mr-4">
              <ArrowLeft />
            </Button>
            <Button size={"icon_md"} onClick={next} disabled={currentQuestionIndex === questions.length - 1}>
              <ArrowRight />
            </Button>
          </div>
          <Button size={"icon_md"} onClick={() => router.push("map")} className="absolute right-5 top-4 ">
            <X />
          </Button>

          {/* 문항수 */}
          <div className="w-full">
            <motion.div
              className={cn("bg-[#2686F5] rounded-[30px] w-[68px] text-white text-center flex justify-center gap-[2px] mx-auto")}
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
        isArabicCountry={isArabicLocale}
        question={question.text}
        bgImageUrl={
          question.backgroundImage?.imagePath
            ? `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${question.backgroundImage.imagePath}`
            : `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/images/background/bg_1.jpg`
        }
        charImageUrl={
          question.characterImage?.imagePath
            ? `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${question.characterImage.imagePath}`
            : `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/images/character/stage1_1.png`
        }
      />
      <div className="pt-[30px] pb-[60px] px-5 flex flex-col gap-4 ">
        {question.options &&
          question.options
            .sort((a, b) => a.order - b.order)
            .map((option: QuestionOption) => {
              return (
                <motion.label
                  aria-readonly
                  key={option.id}
                  className={cn(
                    "rounded-[20px] py-4 px-6 bg-white hover:cursor-pointer",
                    isArabicLocale && "text-right",
                    selectedOptionIds.includes(option.id) && !option.isCorrect && "bg-[#EE3434] text-white pointer-events-none",
                    option.isCorrect && "bg-[#2686F5] text-white pointer-events-none",
                    "pointer-events-none"
                  )}
                >
                  {option.text}
                  {process.env.NODE_ENV !== "production" && <span>({option.isCorrect ? "o" : "x"})</span>}
                  <input type="checkbox" checked={selectedOptionIds.includes(option.id)} readOnly className="hidden" />
                </motion.label>
              );
            })}
      </div>

      {Loader(logsLoading)}
    </div>
  );
}
