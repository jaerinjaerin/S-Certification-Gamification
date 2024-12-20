"use client";
// import { HeartFilledIcon, HeartIcon } from "@/app/components/icons/icons";
import {
  ErrorAlertDialog,
  GameOverAlertDialog,
} from "@/app/components/quiz/alert-dialog";
import CountDownBar from "@/app/components/quiz/countdown-bar";
import Qusetion from "@/app/components/quiz/question-area";
import successNotify from "@/app/components/quiz/success-notify";
import Spinner from "@/app/components/ui/spinner";
import { useCountdown } from "@/app/hooks/useCountdown";
import { cn, fixedClass, sleep } from "@/lib/utils";
import { EndStageResult, useQuiz } from "@/providers/quiz_provider";
import { usePathNavigator } from "@/route/usePathNavigator";
import { QuestionOption } from "@prisma/client";
import { motion } from "motion/react";
import { Fragment, useEffect, useState } from "react";

export default function QuizPage() {
  const {
    currentQuestionIndex,
    currentQuizStage,
    currentStageQuestions,
    endStage,
    nextQuestion,
    canNextQuestion,
    logUserAnswer,
  } = useQuiz();

  const LIFE_COUNT = 5; // currentQuizStage.lifeCount

  const { routeToPage } = usePathNavigator();
  const question =
    currentStageQuestions && currentStageQuestions[currentQuestionIndex];

  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState(false);

  const [lifeCount, setLifeCount] = useState<number>(LIFE_COUNT);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
  const [count, { startCountdown, stopCountdown, resetCountdown }] =
    useCountdown({ countStart: question.timeLimitSeconds });
  const [loading, setLoading] = useState(false);

  const TIME_PROGRESS = (count / question.timeLimitSeconds) * 100;
  const totalQuestions = currentStageQuestions?.length; // stage 당 문제 개수
  const { success, setSuccess, renderSuccessLottie } = successNotify();

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

    // 맞았으면
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
        await sleep(1500);
        await next();
        setSuccess(false);
        return;
      }
    }
    // 틀렸으면 도전 횟수 차감
    else {
      setLifeCount((lifeCount) => lifeCount - 1);
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
    const result: EndStageResult = await endStage(lifeCount); // 남은 하트수
    setSelectedOptionIds([]);
    console.log("👉🏻", result);

    // nextStage();
    routeToPage("complete");
  };

  useEffect(() => {
    if (!currentQuizStage || !currentStageQuestions) {
      setErrorMessage("퀴즈 스테이지를 찾을 수 없습니다.");
    }
  }, [currentQuizStage, currentStageQuestions]);

  useEffect(() => {
    startCountdown();

    if (count === 0) {
      setLifeCount((lifeCount) => lifeCount - 1);
      resetCountdown();
    }
  }, [count]);

  useEffect(() => {
    if (lifeCount === 0) {
      stopCountdown();
      setGameOver(true);
    }
  }, [lifeCount]);

  console.log("question", question);

  return (
    <div className="pt-[70px] min-h-svh bg-slate-300/20 overflow-x-hidden">
      <div className={cn(fixedClass, "top-0 z-10")}>
        <div className={cn("bg-background p-5 grid grid-cols-12 gap-[2px]")}>
          <div className="col-span-4 content-center text-[12px] min-[400px]:text-[14px] text-nowrap font-extrabold">
            Galaxy AI Expert
          </div>
          <div className="col-span-4 justify-items-center content-center">
            <motion.div
              className="bg-[#2686F5] rounded-[30px] w-[68px] text-white text-center flex justify-center gap-[2px]"
              key={currentQuestionIndex}
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
                onClick={() => {
                  handleOptionSave(option.id);
                  handleConfirmAnswer(question, option.id);
                }}
                className={cn(
                  "rounded-[20px] py-4 px-6 bg-white hover:cursor-pointer",
                  selectedOptionIds.includes(option.id) &&
                    !option.isCorrect &&
                    "bg-[#EE3434] text-white pointer-events-none",
                  selectedOptionIds.includes(option.id) &&
                    option.isCorrect &&
                    "bg-[#2686F5] text-white pointer-events-none",
                  isCorrectAnswer && "pointer-events-none"
                )}
                animate={
                  selectedOptionIds.includes(option.id) && !option.isCorrect
                    ? { x: [0, -5, 5, -5, 5, 0] }
                    : selectedOptionIds.includes(option.id) && option.isCorrect
                    ? { scale: [1, 1.1, 1] }
                    : { x: 0, scale: 1 }
                }
                transition={{ duration: 0.5, ease: "easeInOut" }}
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
      <GameOverAlertDialog gameOver={gameOver} />
      <ErrorAlertDialog error={errorMessage} />
      {success && renderSuccessLottie()}
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
