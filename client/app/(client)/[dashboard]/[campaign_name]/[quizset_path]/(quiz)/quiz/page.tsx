"use client";

import { EndStageResult, useQuiz } from "@/providers/quiz_provider";
import { QuestionOption } from "@prisma/client";
import { useState } from "react";

export default function QuizPage() {
  const {
    quizSet,
    // quizHistory,
    currentQuizStageIndex,
    currentQuestionIndex,
    currentQuizStage,
    // currentQuestionOptionIndex,
    // currentStageQuizzes,
    // isFirstBadgeStage,
    // isLastBadgeStage,
    // processFirstBadgeAcquisition,
    // processLastBadgeAcquisition,
    // isComplete,
    // isLastStage,
    currentStageQuestions,
    // isBadgeStage,
    // processBadgeAcquisition,
    // startStage,
    endStage,
    // isLastQuestionOnState,
    confirmAnswer,
    nextStage,
    nextQuestion,
    canNextQuestion,
    quizStagesTotalScore,
    // setCurrentQuestionOptionIndex,
  } = useQuiz();

  // console.log("quizSet", quizSet);

  // // 선택된 옵션 상태
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);

  // useEffect(() => {
  //   if (quizSet) {
  //     startStage();
  //   }
  // }, [quizSet]);

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

  const handleConfirmAnswer = async (questionId: string) => {
    if (selectedOptionIds.length === 0) {
      alert("선택된 옵션이 없습니다.");
      return;
    }

    const result = await confirmAnswer(
      // currentQuizStage?.id,
      questionId,
      selectedOptionIds,
      30
    );

    if (result.isCorrect) {
      alert("정답입니다!");
      next();
    } else {
      alert("틀렸습니다!");
    }
  };

  const next = async () => {
    setSelectedOptionIds([]);

    if (canNextQuestion()) {
      nextQuestion();
      return;
    }

    // if (isBadgeStage()) {
    //   await processBadgeAcquisition();
    //   alert("배지 획득!");
    //   // 배지 획득 화면 처리 로직
    // }

    const result: EndStageResult = await endStage(3);
    alert(`스테이지 완료! 점수: ${result.score}`);

    // if (isLastStage()) {
    //   // 퀴즈 완료 화면 처리 로직
    //   return;
    // }

    // alert(
    //   `${
    //     currentQuizStageIndex + 1
    //   } 번째 스테이지 완료. 다음 스테이지로 이동합니다.`
    // );

    nextStage();
  };

  const handleOptionChange = (optionId: string) => {
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
  };

  const renderQuizPage = () => {
    if (!currentQuizStage || !currentStageQuestions) {
      return <p>퀴즈 스테이지를 찾을 수 없습니다.</p>;
    }

    // const quizStage: QuizStageEx = quizSet.quizStages[currentStage];
    const question = currentStageQuestions[currentQuestionIndex];
    const totalQuestions = currentStageQuestions?.length;
    const totalStages = quizSet.quizStages.length;

    const bgImageUrl = `${process.env.ASSETS_DOMAIN}${currentQuizStage.backgroundImageUrl}`;
    const charImageUrl = `${process.env.ASSETS_DOMAIN}${currentQuizStage.characterImageUrl}`;

    console.log("bgImageUrl", bgImageUrl);

    return (
      <>
        <p>현재까지 스코어: {quizStagesTotalScore}</p>
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
            handleConfirmAnswer(question.id);
            // confirmAnswer(currentQuizStage.id, question.id, selectedOptionIds);
          }}
          disabled={selectedOptionIds.length === 0} // 선택된 옵션이 없으면 버튼 비활성화
        >
          확인
        </button>
        <img src={bgImageUrl} alt="quiz background" />
        <img src={charImageUrl} alt="quiz character" />
      </>
    );
  };

  return <div>{renderQuizPage()}</div>;
}
