"use client";

import {
  ErrorAlertDialog,
  GameOverAlertDialog,
} from "@/app/components/quiz/alert-dialog";
import Qusetion from "@/app/components/quiz/question-area";
import { useCountdown } from "@/app/hooks/useCountdown";
import { EndStageResult, useQuiz } from "@/providers/quiz_provider";
import { QuestionOption } from "@prisma/client";
import { Fragment, useEffect, useState } from "react";
import { motion } from "motion/react";
import CountDownBar from "@/app/components/quiz/countdown-bar";
import { cn, fixedClass } from "@/lib/utils";
import { HeartFilledIcon, HeartIcon } from "@/app/components/icons/icons";
import { sleep } from "@/app/lib/utils";
import { usePathNavigator } from "@/route/usePathNavigator";

export default function QuizPage() {
  const {
    quizSet,
    currentQuizStageIndex,
    currentQuestionIndex,
    currentQuizStage,
    currentStageQuestions,
    endStage,
    confirmAnswer,
    nextStage,
    nextQuestion,
    canNextQuestion,
    quizStagesTotalScore,
    logUserAnswer,
  } = useQuiz();

  const { routeToPage } = usePathNavigator();
  const question =
    currentStageQuestions && currentStageQuestions[currentQuestionIndex];

  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]); // 선택한 option의 id 값을 담은 배열
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean>(false); // 정답인 경우 오답 클릭 방지를 위한 boolean
  const [gameOver, setGameOver] = useState(false);

  const [lifeCount, setLifeCount] = useState<number>(
    currentQuizStage.lifeCount
  );
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
  const [count, { startCountdown, stopCountdown, resetCountdown }] =
    useCountdown({ countStart: question.timeLimitSeconds });

  const progress = (count / question.timeLimitSeconds) * 100; // question.timeLimitSeconds
  const totalQuestions = currentStageQuestions?.length; // stage 당 문제 개수
  // const totalStages = quizSet.quizStages.length; //전체 stage 개수

  const handleOptionSave = (optionId: string) => {
    setSelectedOptionIds((prevSelected) => {
      // 이미 선택된 옵션이면 그대로 유지
      if (prevSelected.includes(optionId)) {
        return [...prevSelected];
      }
      // 선택된 옵션 추가
      else {
        return [...prevSelected, optionId];
      }
    });
  };

  const handleConfirmAnswer = async (question: any, optionId: string) => {
    const result = question.options.find((option) => option.id === optionId);
    const selectedOptIds = [...new Set([...selectedOptionIds, optionId])];
    const elapsedSeconds = question.timeLimitSeconds - count;
    // console.log(question.id, selectedOptIds, elapsedSeconds, true);

    // 맞았으면
    if (result.isCorrect) {
      // 모두 맞았으면
      // 다음문제로 넘어가는 조건: selectedOptionIds, optionId의 isCorrect 수와 question.options.isCorrect 수가 같을 경우 next()
      const isAllCorrectSelected = question.options.every((option) =>
        option.isCorrect ? selectedOptIds.includes(option.id) : true
      );

      if (isAllCorrectSelected) {
        setIsCorrectAnswer(true);
        logUserAnswer(question.id, selectedOptIds, elapsedSeconds, true);
        await sleep(1000);
        await next();
      }

      resetCountdown();
    }
    // 틀렸으면 도전 횟수 차감
    else {
      setLifeCount((lifeCount) => lifeCount - 1);
      logUserAnswer(question.id, selectedOptIds, elapsedSeconds, false);
    }
  };

  // const handleConfirmAnswer = async (questionId: string) => {
  //   if (selectedOptionIds.length === 0) {
  //     alert("선택된 옵션이 없습니다.");
  //     return;
  //   }

  //   const result = await confirmAnswer(
  //     // currentQuizStage?.id,
  //     questionId,
  //     selectedOptionIds,
  //     30
  //   );

  //   if (result.isCorrect) {
  //     alert("정답입니다!");
  //     next();
  //   } else {
  //     alert("틀렸습니다!");
  //   }
  // };

  const next = async () => {
    setSelectedOptionIds([]);
    setIsCorrectAnswer(false);

    if (canNextQuestion()) {
      nextQuestion();
      return;
    }

    const result: EndStageResult = await endStage(lifeCount); // 남은 하트수
    alert(`스테이지 완료! 점수: ${result.score} 남은 하트 수: ${lifeCount}`);

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

  // return <div>{renderQuizPage()}</div>;

  return (
    <div className="pt-[70px]">
      <div className={cn(fixedClass, "top-0 z-10")}>
        <div className={cn("bg-background p-5 grid grid-cols-12 gap-[2px]")}>
          <div className="col-span-4 content-center text-[14px]">
            Galaxy AI Expert
          </div>
          <div className="col-span-4 justify-items-center content-center">
            <div className="bg-[#2686F5] rounded-[30px] w-[68px] text-white text-center flex justify-center gap-[2px]">
              <span>{currentQuestionIndex + 1}</span>
              <span>/</span>
              <span>{totalQuestions}</span>
            </div>
          </div>
          <div className="col-span-4 flex self-center gap-1 justify-end">
            {Array.from({ length: currentQuizStage.lifeCount }).map(
              (_, index) => (
                <Fragment key={index}>
                  {index < lifeCount ? <HeartFilledIcon /> : <HeartIcon />}
                </Fragment>
              )
            )}
          </div>
        </div>
        <CountDownBar progress={progress} />
      </div>

      <Qusetion currentQuizStage={currentQuizStage} question={question} />
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
    </div>
  );
}
