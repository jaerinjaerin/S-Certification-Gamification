"use client";
import { HeartFilledIcon, HeartIcon } from "@/app/components/icons/icons";
import { Fragment, useEffect, useState } from "react";
import { useQuiz } from "@/providers/quiz_provider";
import { usePathNavigator } from "@/route/usePathNavigator";
import { sleep } from "@/app/lib/utils";
import GameOverAlertDialog from "@/app/components/quiz/game-over-alert";
import CountDownBar from "@/app/components/quiz/countdown-bar";
import Qusetion from "@/app/components/quiz/question-area";
import { motion } from "motion/react";
import { QuestionOption } from "@prisma/client";
import { cn } from "@/lib/utils";
import { useCountdown } from "@/app/hooks/useCountdown";

export default function QuizPage() {
  const {
    quizSet,
    currentQuizStageIndex,
    currentQuestionIndex,
    currentQuizStage,
    currentStageQuizzes,
    isFirstBadgeStage,
    isLastBadgeStage,
    processFirstBadgeAcquisition,
    processLastBadgeAcquisition,
    startStage,
    endStage,
    nextStage,
    nextQuestion,
    canNextQuestion,
  } = useQuiz();
  const { routeToPage } = usePathNavigator();
  // console.log("quizSet", quizSet);
  const question = currentStageQuizzes && currentStageQuizzes[currentQuestionIndex];

  // 선택된 옵션 상태
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [lifeCount, setLifeCount] = useState<number>(currentQuizStage.lifeCount);
  const [gameOver, setGameOver] = useState(false);
  const [isSelectedCorrectCount, setIsSelectedCorrectCount] = useState(0);

  const [count, { startCountdown, stopCountdown, resetCountdown }] = useCountdown({ countStart: question.timeLimitSeconds });

  useEffect(() => {
    if (quizSet) {
      startStage();
      startCountdown();
    }
  }, [quizSet, startStage]);

  useEffect(() => {
    if (lifeCount > 0) return;

    stopCountdown();
    setGameOver(true);
  }, [lifeCount]);

  useEffect(() => {
    if (count === 0) {
      setLifeCount((lifeCount) => lifeCount - 1);
      resetCountdown();
      startCountdown();
    }
  }, [count]);

  /**
   * 선택한 optionId를 모두 저장
   */
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

  /**
   * 선택한 optionId가 정답인지 오답인지 체크
   * 모두 맞췄을 경우 - 다음 문제로 이동
   * 틀렸을 경우 - 기회 차감
   */
  const handleConfirmAnswer = async (question: any, optionId: string) => {
    const result = question.options.find((option) => option.id === optionId);

    // 맞았으면
    if (result.isCorrect) {
      // 모두 맞았으면
      // 다음문제로 넘어가는 조건: selectedOptionIds, optionId의 isCorrect 수와 question.options.isCorrect 수가 같을 경우 next()
      const correctCount = question.options.map((option) => option.isCorrect).filter((answer) => answer === true).length;
      const selectedIds = question.options.filter((option) => [...new Set([...selectedOptionIds, optionId])].includes(option.id));
      const selectedCorrectCount = selectedIds.filter((id) => id.isCorrect === true).length;
      setIsSelectedCorrectCount(selectedCorrectCount);

      if (correctCount === selectedCorrectCount) {
        await sleep(1000);
        await next();
      }

      resetCountdown();
    }
    // 틀렸으면 도전 횟수 차감 & 시간 다시 시작
    else {
      setLifeCount((lifeCount) => lifeCount - 1);
    }
  };

  const next = async () => {
    setSelectedOptionIds([]);
    setIsSelectedCorrectCount(0);

    if (canNextQuestion()) {
      console.log("canNextQuestion");
      nextQuestion();
      return;
    }

    if (isFirstBadgeStage()) {
      await processFirstBadgeAcquisition();
      alert("첫 번째 배지 획득!");
      // 배지 획득 화면 처리 로직
      endStage();
    } else if (isLastBadgeStage()) {
      await processLastBadgeAcquisition();
      alert("배지 획득!");
      // 배지 획득 화면 처리 로직
      endStage();
      return;
    }

    // if (isLastStage()) {
    //   // 퀴즈 완료 화면 처리 로직
    //   return;
    // }

    // alert(`${currentQuizStageIndex + 1} 번째 스테이지 완료. 다음 스테이지로 이동합니다.`);
    routeToPage("complete");

    // nextStage();
  };

  if (!currentQuizStage || !currentStageQuizzes) {
    return <p>퀴즈 스테이지를 찾을 수 없습니다.</p>;
  }

  return (
    <div
      className="h-full bg-[#F7F7F7]"
      style={{
        backgroundImage: `url('/assets/bg_main2.png')`,
      }}
    >
      {/* QuizHeader */}
      <div className="fixed min-w-[280px] max-w-[412px] w-full z-10 ">
        <div className=" bg-background p-5 grid grid-cols-12 gap-[2px]">
          <div className="col-span-4 content-center text-[14px]" onClick={() => routeToPage("map")}>
            Galaxy AI Expert
          </div>
          <div className="col-span-4 justify-items-center content-center">
            <div className="bg-[#2686F5] rounded-[30px] w-[68px] text-white text-center flex justify-center gap-[2px]">
              <span>{currentQuestionIndex + 1}</span>
              <span>/</span>
              <span>{currentStageQuizzes && currentStageQuizzes.length}</span>
            </div>
          </div>
          <div className="col-span-4 flex self-center gap-1 justify-end">
            {Array.from({ length: currentQuizStage.lifeCount }).map((_, index) => (
              <Fragment key={index}>{index < lifeCount ? <HeartFilledIcon /> : <HeartIcon />}</Fragment>
            ))}
          </div>
        </div>
        <CountDownBar progress={(count / question.timeLimitSeconds) * 100} />
      </div>

      {/* Question Area*/}
      <div className="pt-[70px]">
        <Qusetion questionText={question.text} />
        {/* answer Area*/}
        <div className="pt-[30px] pb-[60px] px-5 flex flex-col gap-4">
          {question.options &&
            question.options.map((option: QuestionOption) => {
              return (
                <motion.label
                  key={option.id}
                  onClick={() => {
                    handleOptionSave(option.id);
                    handleConfirmAnswer(question, option.id);
                    console.log("click");
                  }}
                  className={cn(
                    "rounded-[20px] py-4 px-6 bg-white hover:cursor-pointer",
                    selectedOptionIds.includes(option.id) && !option.isCorrect && "bg-[#EE3434] text-white",
                    selectedOptionIds.includes(option.id) && option.isCorrect && "bg-[#2686F5] text-white",
                    isSelectedCorrectCount && "pointer-events-none"
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
      </div>
      <GameOverAlertDialog gameOver={gameOver} />
    </div>
  );
}
