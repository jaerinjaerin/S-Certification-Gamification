"use client";
import { HeartFilledIcon, HeartIcon } from "@/app/components/icons/icons";
import { type QuestionOption, QuestionType } from "@prisma/client";
import React, { Fragment, useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import useTimer from "@/app/hooks/useTimer";
import { useQuiz } from "@/providers/quiz_provider";
import { cn, sleep } from "@/app/lib/utils";
import { usePathNavigator } from "@/route/usePathNavigator";
import { motion } from "motion/react";
import SpeechBubble from "@/app/components/quiz/speech-bubble";

export default function QuizPage() {
  const {
    quizSet,
    // quizHistory,
    currentQuizStageIndex,
    currentQuestionIndex,
    currentQuizStage,
    // currentQuestionOptionIndex,
    currentStageQuizzes,
    isFirstBadgeStage,
    isLastBadgeStage,
    processFirstBadgeAcquisition,
    processLastBadgeAcquisition,
    // isComplete,
    // isLastStage,
    startStage,
    endStage,
    // isLastQuestionOnState,
    // confirmAnswer,
    nextStage,
    nextQuestion,
    canNextQuestion,
    // setCurrentQuestionOptionIndex,
  } = useQuiz();
  const { routeToPage } = usePathNavigator();
  // console.log("quizSet", quizSet);

  // 선택된 옵션 상태
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  // console.log(selectedOptionIds, "선택된 옵션 상태");

  // 현재 남은 목숨 개수
  const [lifeLeft, setLifeLeft] = useState<number>(currentQuizStage.lifeCount);

  const question = currentStageQuizzes && currentStageQuizzes[currentQuestionIndex];
  const totalStages = quizSet.quizStages.length;

  const { time, start: startTimer, stop: stopTimer, resetAndStart: resetAndStartTimer } = useTimer(question.timeLimitSeconds);
  const progress = Math.floor((time / question.timeLimitSeconds) * 100); // 진행 상태 (%)

  useEffect(() => {
    if (quizSet) {
      startStage();
    }
  }, [quizSet, startStage]);

  useEffect(() => {
    startTimer();
  }, [lifeLeft, currentQuestionIndex]);

  useEffect(() => {
    if (lifeLeft === 0) {
      console.log("stage 실패");
      stopTimer();
      // routeToPage("map");
      // TODO: popup 렌더링 - 재도전하시겠습니까?
    }
  }, [lifeLeft]);

  useEffect(() => {
    if (time === 0) {
      setLifeLeft((life) => life - 1);
      resetAndStartTimer();
    }
  }, [time]);

  if (!currentQuizStage || !currentStageQuizzes) {
    return <p>퀴즈 스테이지를 찾을 수 없습니다.</p>;
  }

  // const routeNextQuizComplete = () => {
  //   routeToPage("complete");
  // };

  // const confirmAnswer = (
  //   quizStageId: string,
  //   questionId: string,
  //   optionId: string
  // ) => {
  //   console.log("Selected Option:", optionId); // 선택된 옵션 확인

  //   const isCorrect =
  //     quizSet.quizStages
  //       .find((stage: QuizStageEx) => stage.id === quizStageId)
  //       ?.questions.find((question: QuestionEx) => question.id === questionId)
  //       ?.options?.find((option: QuestionOption) => option.id === optionId)
  //       ?.isCorrect ?? false;

  //   if (isCorrect) {
  //     alert("정답입니다!");
  //     // send qeustion log to server
  //     if (
  //       currentQuestionIndex ===
  //       quizSet.quizStages[currentStage].questions.length - 1
  //     ) {
  //       if (currentStage === quizSet.quizStages.length - 1) {
  //         // send stage log to server
  //         // update user quiz history
  //         alert("퀴즈를 모두 완료했습니다!");
  //         routeNextQuizComplete();
  //         return;
  //       }

  //       alert("다음 스테이지로 이동합니다!");
  //       // send stage log to server
  //       // update user quiz history

  //       setCurrentStage(currentStage + 1);
  //       setSelectedOptionId(null);
  //       setCurrentQuestionIndex(0);
  //       return;
  //     }

  //     setCurrentQuestionIndex(currentQuestionIndex + 1);
  //     setSelectedOptionId(null);
  //   } else {
  //     alert("틀렸습니다!");
  //     // send qeustion log to server
  //   }
  // };

  const handleConfirmAnswer = async (questionId: string, optionId: string, questionType: QuestionType) => {
    if (questionType === "MULTIPLE_CHOICE") {
      // TODO: multiselect일때도 수정해야함
      // if (selectedOptionIds.length === 0) {
      //   alert("선택된 옵션이 없습니다.");
      //   return;
      // }
      // const result = await confirmAnswer(currentQuizStage?.id, questionId, selectedOptionIds);
      // if (!result.success) {
      //   alert(result.error);
      //   return;
      // }
      // if (result.data.isCorrect) {
      //   alert("정답입니다!");
      //   next();
      //   resetAndStartTimer();
      // } else {
      //   alert("틀렸습니다!");
      // }
    } else {
      console.log(`
        questionId(문제 id): ${questionId},
        optionId(내가 선택한 답 id): ${optionId}
        `);

      const result = currentStageQuizzes[currentQuestionIndex].options.find((option) => option.id === optionId);

      if (result.isCorrect) {
        await sleep(1000);
        next();
        resetAndStartTimer();
      } else {
        setLifeLeft((life) => life - 1);
        resetAndStartTimer();
      }
    }
  };

  const next = async () => {
    setSelectedOptionIds([]);

    if (canNextQuestion()) {
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

    alert(`${currentQuizStageIndex + 1} 번째 스테이지 완료. 다음 스테이지로 이동합니다.`);

    nextStage();
  };

  const handleOptionChange = (optionId: string, questionType: QuestionType) => {
    if (questionType === "MULTIPLE_CHOICE") {
      setSelectedOptionIds((prevSelected) => {
        if (prevSelected.includes(optionId)) {
          // 이미 선택된 옵션이면 제거
          console.log(`Option ${optionId} 해지됨`);

          const result = prevSelected.filter((id) => id !== optionId);
          console.log("result", result);
          return result;
        } else {
          // 선택된 옵션 추가
          console.log(`Option ${optionId} 선택됨`);

          return [...prevSelected, optionId];
        }
      });
    } else {
      setSelectedOptionIds((prevSelected) => {
        if (prevSelected.includes(optionId)) return [...prevSelected];
        return [optionId];
      });
    }
  };

  // console.log("currentQuestionIndex", currentQuestionIndex);

  const renderQuizPage = () => {
    if (!currentQuizStage || !currentStageQuizzes) {
      return <p>퀴즈 스테이지를 찾을 수 없습니다.</p>;
    }

    // const quizStage: QuizStageEx = quizSet.quizStages[currentStage];
    const question = currentStageQuizzes[currentQuestionIndex];
    const totalQuestions = currentStageQuizzes?.length;
    const totalStages = quizSet.quizStages.length;

    console.log(currentQuizStage);

    return (
      <>
        <p>
          stage: {currentQuizStageIndex + 1}/{totalStages}
        </p>
        <p>stage에 주어진 하트 수: {currentQuizStage.lifeCount}</p>
        <p>
          question: {currentQuestionIndex + 1}/{totalQuestions}
        </p>
        <h3>{currentQuizStage?.name}</h3>
        <p>시간제한: {question.timeLimitSeconds}</p>
        <p>{question.text}</p>
        {question.options &&
          question.options.map((option: QuestionOption) => (
            <div key={option.id}>
              <input
                type="checkbox"
                name="option"
                value={option.id}
                checked={selectedOptionIds.includes(option.id)}
                onChange={() => handleOptionChange(option.id)} // 옵션 선택/해제 처리
              />
              <label>
                {option.text}({option.isCorrect ? "o" : "x"})
              </label>
            </div>
          ))}
        <button
          onClick={() => {
            // handleConfirmAnswer(question.id);
            // confirmAnswer(currentQuizStage.id, question.id, selectedOptionIds);
          }}
          disabled={selectedOptionIds.length === 0} // 선택된 옵션이 없으면 버튼 비활성화
        >
          확인
        </button>
      </>
    );
  };

  return (
    <div className="h-full ">
      {/* {renderQuizPage()} */}
      {/* QuizHeader */}
      <div className="bg-background p-5 grid grid-cols-12 gap-[2px]">
        <div className="col-span-4 content-center text-[14px]">Galaxy AI Expert</div>
        <div className="col-span-4 justify-items-center content-center">
          <div className="bg-[#2686F5] rounded-[30px] w-[68px] text-white text-center flex justify-center gap-[2px]">
            <span>{currentQuestionIndex + 1}</span>
            <span>/</span>
            <span>{currentStageQuizzes.length}</span>
          </div>
        </div>
        <div className="col-span-4 flex self-center gap-1 justify-end">
          {Array.from({ length: currentQuizStage.lifeCount }).map((_, index) => (
            <Fragment key={index}>{index < lifeLeft ? <HeartFilledIcon /> : <HeartIcon />}</Fragment>
          ))}
        </div>
      </div>

      {/* TimeBar */}
      <div className="bg-white relative h-[6px]">
        <motion.div
          className={cn("bg-black h-[6px] w-full absolute top-0 transition-colors duration-500")}
          initial={{ width: "100%" }}
          animate={{
            width: `${progress}%`,
          }}
          transition={{
            duration: 0.5,
          }}
        ></motion.div>
      </div>

      {/* Question */}
      <div
        className="min-h-[480px] flex flex-col justify-between"
        style={{
          backgroundImage: `url("/assets/bg_main1.png")`,
        }}
      >
        <SpeechBubble>{question.text}</SpeechBubble>
        <div
          style={{ backgroundImage: `url("/assets/character/man_01.png")`, backgroundPosition: "center bottom" }}
          className="h-[309px] bg-no-repeat"
        ></div>
      </div>
      {/* answer */}
      <div className="pt-[30px] px-5 flex flex-col gap-4">
        {question.options &&
          question.options.map((option: QuestionOption) => {
            return (
              <QuestionOption
                questionType={question.questionType}
                question={question}
                option={option}
                key={option.id}
                selectedOptionIds={selectedOptionIds}
                handleOptionChange={handleOptionChange}
                handleConfirmAnswer={handleConfirmAnswer}
              />
            );
          })}
      </div>
    </div>
  );
}

const Question = ({
  question,
  selectedOptionIds,
  handleOptionChange,
  handleConfirmAnswer,
}: {
  question: any;
  selectedOptionIds: string[];
  handleOptionChange: (optionId: string) => void;
  handleConfirmAnswer: (questionId: string) => Promise<void>;
}) => {
  return (
    <>
      <div
        className="min-h-[480px] flex flex-col justify-between"
        style={{
          backgroundImage: `url("/assets/bg_main1.png")`,
        }}
      >
        <SpeechBubble>{question.text}</SpeechBubble>
        <div
          style={{ backgroundImage: `url("/assets/character/man_01.png")`, backgroundPosition: "center bottom" }}
          className="h-[309px] bg-no-repeat"
        ></div>
      </div>
      {/* answer */}
      <div className="pt-[30px] px-5">
        {question.options &&
          question.options.map((option: QuestionOption) => (
            <div key={option.id}>
              <input
                type="checkbox"
                name="option"
                value={option.id}
                checked={selectedOptionIds.includes(option.id)}
                onChange={() => handleOptionChange(option.id)} // 옵션 선택/해제 처리
              />
              <label>
                {option.text}({option.isCorrect ? "o" : "x"})
              </label>
            </div>
          ))}
        <Button
          variant={"primary"}
          onClick={() => {
            handleConfirmAnswer(question.id);
            // confirmAnswer(currentQuizStage.id, question.id, selectedOptionIds);
          }}
          disabled={selectedOptionIds.length === 0} // 선택된 옵션이 없으면 버튼 비활성화
        >
          확인
        </Button>
      </div>
    </>
  );
};

const QuestionOption = ({
  questionType,
  question,
  option,
  selectedOptionIds,
  handleOptionChange,
  handleConfirmAnswer,
}: {
  questionType: QuestionType;
  question: any;
  option: QuestionOption;
  selectedOptionIds: string[];
  handleOptionChange: (optionId: string, questionType: QuestionType) => void;
  handleConfirmAnswer: (questionId: string, optionId: string, questionType: QuestionType) => Promise<void>;
}) => {
  if (questionType === "MULTIPLE_CHOICE") {
    return (
      <div key={option.id} className="bg-white rounded-[20px] py-4 px-6 checked:bg-red-400">
        <label className="bg-blue-50">
          <input
            type="checkbox"
            name="option"
            value={option.id}
            checked={selectedOptionIds.includes(option.id)}
            onChange={() => handleOptionChange(option.id, questionType)} // 옵션 선택/해제 처리
            onClick={() => console.log("바로 확인 가능")}
            className="hidden"
          />
          {option.text}({option.isCorrect ? "o" : "x"})
        </label>
      </div>
    );
  }
  return (
    <motion.label
      key={option.id}
      className={cn(
        "bg-white rounded-[20px] py-4 px-6 transition-colors cursor-pointer",
        selectedOptionIds.includes(option.id) && !option.isCorrect && "bg-[#EE3434] text-white",
        selectedOptionIds.includes(option.id) && option.isCorrect && "bg-[#2686F5] text-white"
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
      <input
        type="radio"
        name="option"
        value={option.id}
        id={option.id}
        className="hidden"
        onClick={() => {
          handleOptionChange(option.id, questionType);
          handleConfirmAnswer(question.id, option.id, questionType);
        }}
      />
      <span>
        {option.text}({option.isCorrect ? "o" : "x"})
      </span>
    </motion.label>
  );
};
