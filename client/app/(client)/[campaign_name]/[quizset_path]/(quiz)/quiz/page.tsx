"use client";
// import { HeartFilledIcon, HeartIcon } from "@/components/icons/icons";
import {
  ErrorAlertDialog,
  GameOverAlertDialog,
} from "@/components/quiz/alert-dialog";
import CountDownBar from "@/components/quiz/countdown-bar";
import Qusetion from "@/components/quiz/question-area";
import SuccessNotify from "@/components/quiz/success-notify";
import Spinner from "@/components/ui/spinner";
import useGAPageView from "@/core/monitoring/ga/usePageView";
import { useCountdown } from "@/hooks/useCountdown";
import { useQuiz } from "@/providers/quizProvider";
import { usePathNavigator } from "@/route/usePathNavigator";
import { QuestionEx } from "@/types/apiTypes";
import { cn, sleep } from "@/utils/utils";
import { QuestionOption } from "@prisma/client";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";

export default function QuizPage() {
  useGAPageView();
  const {
    currentQuestionIndex,
    currentQuizStage,
    currentStageQuestions,
    endStage,
    failStage,
    nextQuestion,
    canNextQuestion,
    logUserAnswer,
    isComplete,
  } = useQuiz();
  const translation = useTranslations();
  const { routeToPage } = usePathNavigator();

  const question: QuestionEx = currentStageQuestions[currentQuestionIndex];
  const currentStageTotalQuestions = currentStageQuestions?.length;

  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean>(false);

  const LIFE_COUNT = currentQuizStage?.lifeCount ?? 5; // currentQuizStage.lifeCount
  const [gameOver, setGameOver] = useState(false);
  const [lifeCount, setLifeCount] = useState<number>(LIFE_COUNT);
  const [count, { startCountdown, stopCountdown, resetCountdown }] =
    useCountdown({ countStart: question.timeLimitSeconds });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );

  const animationRef = useRef<boolean | null>(null); // 애니메이션 상태 관리
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const TIME_PROGRESS = (count / question.timeLimitSeconds) * 100;
  const ANIMATON_DURATION = 3_000;

  const locale = useLocale();
  const isArabic = locale === "ar-AE";

  // 애니메이션 트리거
  const triggerAnimation = () => {
    if (animationRef.current) return; // 이미 실행 중인 경우 방지

    animationRef.current = true; // 애니메이션 실행 중
    animationTimeoutRef.current = setTimeout(() => {
      stopAnimation(); // 최대 2초 후 애니메이션 중단
    }, ANIMATON_DURATION);
  };

  // 애니메이션 중단
  const stopAnimation = () => {
    animationRef.current = false; // 애니메이션 상태 초기화
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
  };

  const handleOptionSave = (optionId: string) => {
    setSelectedOptionIds((prevSelected) => {
      if (prevSelected.includes(optionId)) {
        return [...prevSelected];
      }
      return [...prevSelected, optionId];
    });
  };

  const handleConfirmAnswer = async (question: any, optionId: string) => {
    const result = question.options.find((option) => option.id === optionId);
    const selectedOptIds = [...new Set([...selectedOptionIds, optionId])];
    const elapsedSeconds = question.timeLimitSeconds - count;

    if (result.isCorrect) {
      // 다음문제로 넘어가는 조건: selectedOptionIds, optionId의 isCorrect 수와 question.options.isCorrect 수가 같을 경우 next()
      const isAllCorrectSelected = question.options.every((option) =>
        option.isCorrect ? selectedOptIds.includes(option.id) : true
      );

      if (isAllCorrectSelected) {
        setIsCorrectAnswer(true);
        stopCountdown();
        setSuccess(true);
        logUserAnswer(question.id, selectedOptIds, elapsedSeconds, true);
        stopAnimation();
        await sleep(1500);
        await next();
        setSuccess(false);
        return;
      }
    } else {
      setLifeCount((lifeCount) => lifeCount - 1);
      triggerAnimation();
      logUserAnswer(question.id, selectedOptIds, elapsedSeconds, false);
    }
  };

  const next = async () => {
    setIsCorrectAnswer(false);

    if (canNextQuestion()) {
      setSelectedOptionIds([]);
      nextQuestion();
      window.scrollTo({ top: 0, behavior: "smooth" });
      resetCountdown();
      return;
    }

    setLoading(true);
    await endStage(lifeCount); // 남은 하트수
    setSelectedOptionIds([]);

    // nextStage();
    routeToPage("complete");
  };

  const handleGameOver = useCallback(async () => {
    setLoading(true);
    await failStage();
    setLoading(false);
    stopCountdown();
    setGameOver(true);
  }, [stopCountdown, setGameOver]);

  const handleRestart = useCallback(() => {
    resetCountdown();
    startCountdown();
  }, [resetCountdown, startCountdown]);

  const handleLifeDecrease = useCallback(() => {
    setLifeCount((prev) => prev - 1);
    handleRestart();
  }, [resetCountdown, setLifeCount, startCountdown]);

  useEffect(() => {
    if (!currentQuizStage || !currentStageQuestions) {
      setErrorMessage("퀴즈 스테이지를 찾을 수 없습니다.");
    }
  }, [currentQuizStage, currentStageQuestions]);

  useEffect(() => {
    setLoading(true);

    if (isComplete()) {
      routeToPage("/map");
      return;
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    handleRestart();
  }, [currentQuestionIndex, resetCountdown, startCountdown]);

  useEffect(() => {
    if (count <= 0) {
      handleLifeDecrease();
      triggerAnimation();
    }
  }, [count, handleLifeDecrease]);

  useEffect(() => {
    if (lifeCount === 0) {
      handleGameOver();
      stopAnimation();
    }
  }, [lifeCount, handleGameOver]);

  function getAnimateState(option: QuestionOption) {
    if (selectedOptionIds.includes(option.id)) {
      return {
        x: !option.isCorrect ? [0, -5, 5, -5, 5, 0] : 0,
        scale: !option.isCorrect ? 1 : [1, 1.1, 1],
        backgroundColor: option.isCorrect ? "#2686F5" : "#EE3434",
        color: "#ffffff",
        PointerEvent: "none" as const,
      };
    }

    return {
      x: 0,
      scale: 1,
    };
  }

  return (
    <div className="min-h-svh bg-slate-300/20">
      <div className="sticky top-0 z-10">
        <div className=" p-5 h-[70px] flex items-center gap-[10px] bg-white">
          <div className="justify-start flex-1 min-w-0 text-xs min-[300px]:text-sm text-pretty">
            {translation("galaxy_ai_expert")}
          </div>
          {/* quiz 현재 상태 */}
          <div className="flex-none">
            <motion.div
              className="bg-[#2686F5] rounded-[30px] w-[68px] text-white text-center flex justify-center gap-[2px] font-medium text-sm py-1"
              key={currentQuestionIndex}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, ease: "easeInOut", stiffness: 500 }}
            >
              <span>{currentQuestionIndex + 1}</span>
              <span>/</span>
              <span>{currentStageTotalQuestions}</span>
            </motion.div>
          </div>
          {/* 하트 */}
          <div className="flex justify-end flex-1 min-w-0 gap-1 ">
            {Array.from({ length: LIFE_COUNT }).map((_, index) => (
              <AnimatedHeartIcon
                key={index}
                index={index}
                lifeCount={lifeCount}
              />
            ))}
          </div>
        </div>
        <CountDownBar progress={TIME_PROGRESS} />
      </div>
      <Qusetion
        question={question.text}
        bgImageUrl={
          question.backgroundImage?.imagePath
            ? `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${question.backgroundImage.imagePath}`
            : `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/images/background/bg_1.jpg`
        }
        charImageUrl={
          question.characterImage?.imagePath
            ? `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${question.characterImage.imagePath}`
            : `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/images/character/stage1_1.png`
        }
      />
      <div className="pt-[32px] pb-[48px] px-5 flex flex-col gap-4 ">
        {question.options &&
          question.options.map((option: QuestionOption) => {
            return (
              <motion.label
                key={option.id}
                onClick={() => {
                  handleOptionSave(option.id);
                  handleConfirmAnswer(question, option.id);
                }}
                className={cn(
                  "relative rounded-[20px] py-4 px-6 hover:cursor-pointer font-one font-semibold text-lg overflow-hidden",
                  isCorrectAnswer && "pointer-events-none",
                  isArabic && "text-right"
                )}
                initial={{ backgroundColor: "#FFFFFF", color: "#0F0F0F" }}
                animate={getAnimateState(option)}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                {option.text}
                {process.env.NODE_ENV !== "production" && (
                  <span>({option.isCorrect ? "o" : "x"})</span>
                )}
                <input
                  type="checkbox"
                  checked={selectedOptionIds.includes(option.id)}
                  readOnly
                  className="hidden"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                />
                {option.isCorrect && animationRef.current && (
                  <div
                    className={cn(
                      "absolute w-full h-full top-0 left-0 rounded-[20px]"
                    )}
                  >
                    <HintAnimation />
                  </div>
                )}
              </motion.label>
            );
          })}
      </div>
      <GameOverAlertDialog gameOver={gameOver} />
      <ErrorAlertDialog error={errorMessage} />
      {success && <SuccessNotify />}
      {loading && <Spinner />}
    </div>
  );
}

const AnimatedHeartIcon = ({
  index,
  lifeCount,
  onAnimationEnd,
}: {
  index: number;
  lifeCount: number;
  onAnimationEnd?: () => void;
}) => {
  return (
    <Fragment key={index}>
      {index < lifeCount ? (
        <motion.svg
          className="size-4"
          width="19"
          height="17"
          viewBox="0 0 19 17"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          onAnimationComplete={onAnimationEnd}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
        >
          <motion.path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.16039 1.95783C7.32765 -0.1848 4.27143 -0.761161 1.97514 1.20085C-0.32116 3.16285 -0.644446 6.44323 1.15885 8.7637C2.65817 10.693 7.19562 14.7621 8.68276 16.0791C8.84914 16.2264 8.93233 16.3001 9.02936 16.3291C9.11405 16.3543 9.20672 16.3543 9.29142 16.3291C9.38845 16.3001 9.47164 16.2264 9.63802 16.0791C11.1252 14.7621 15.6626 10.693 17.1619 8.7637C18.9652 6.44323 18.6814 3.14221 16.3456 1.20085C14.0099 -0.740523 10.9931 -0.1848 9.16039 1.95783Z"
            fill="#EE3434"
          />
        </motion.svg>
      ) : (
        <motion.svg
          className="size-4"
          width="20"
          height="19"
          viewBox="0 0 20 19"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          initial={{ scale: 1, opacity: 1 }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.8, 1],
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
        >
          <motion.path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.1604 3.30573C8.32765 1.1631 5.27143 0.586739 2.97514 2.54875C0.67884 4.51075 0.355554 7.79113 2.15885 10.1116C3.65817 12.0409 8.19562 16.11 9.68276 17.427C9.84914 17.5743 9.93233 17.648 10.0294 17.677C10.1141 17.7022 10.2067 17.7022 10.2914 17.677C10.3885 17.648 10.4716 17.5743 10.638 17.427C12.1252 16.11 16.6626 12.0409 18.1619 10.1116C19.9652 7.79113 19.6814 4.49011 17.3456 2.54875C15.0099 0.607378 11.9931 1.1631 10.1604 3.30573Z"
            stroke="#EE3434"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      )}
    </Fragment>
  );
};

const HintAnimation = () => {
  return (
    <div className="relative z-0 flex overflow-hidden ">
      <TranslateWrapper>
        <svg
          width="201"
          height="100%"
          viewBox="0 0 201 auto"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="0.741943"
            width="200"
            height="100%"
            transform="rotate(0.285261 0.741943 0)"
            fill="url(#paint0_linear_1561_8491)"
          />
          <defs>
            <linearGradient
              id="paint0_linear_1561_8491"
              x1="175.172"
              y1="34.132"
              x2="90.7222"
              y2="110.213"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#C3E0F8" stopOpacity="0" />
              <stop offset="0.525" stopColor="#C3E0F8" stopOpacity="0.6" />
              <stop offset="1" stopColor="#C3E0F8" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </TranslateWrapper>
    </div>
  );
};

const TranslateWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ translateX: "-100%" }}
      animate={{ translateX: "160%" }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="h-full px-2"
    >
      {children}
    </motion.div>
  );
};
