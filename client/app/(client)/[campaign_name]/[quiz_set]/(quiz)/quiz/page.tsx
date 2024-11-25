"use client";

import { QuestionEx, QuizStageEx } from "@/app/types/type";
import { useQuizHistory } from "@/providers/quiz_history_provider";
import { useQuiz } from "@/providers/quiz_provider";
import { QuestionOption } from "@prisma/client";
import { useState } from "react";

export default function QuizPage() {
  const { quizSet } = useQuiz();
  const { quizHistory } = useQuizHistory();
  const [currentStage, setCurrentStage] = useState(
    quizHistory?.lastCompletedStage ?? 0
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // 선택된 옵션 상태
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const routeNextQuizComplete = () => {
    const currentUrl = new URL(window.location.href);
    const queryString = currentUrl.search;
    const targetUrl = `/complete${queryString}`;
    window.location.href = targetUrl;
  };

  const confirmAnswer = (
    quizStageId: string,
    questionId: string,
    optionId: string
  ) => {
    console.log("Selected Option:", optionId); // 선택된 옵션 확인

    const isCorrect =
      quizSet.quizStages
        .find((stage: QuizStageEx) => stage.id === quizStageId)
        ?.questions.find((question: QuestionEx) => question.id === questionId)
        ?.options?.find((option: QuestionOption) => option.id === optionId)
        ?.isCorrect ?? false;

    if (isCorrect) {
      alert("정답입니다!");
      // send qeustion log to server
      if (
        currentQuestionIndex ===
        quizSet.quizStages[currentStage].questions.length - 1
      ) {
        if (currentStage === quizSet.quizStages.length - 1) {
          // send stage log to server
          // update user quiz history
          alert("퀴즈를 모두 완료했습니다!");
          routeNextQuizComplete();
          return;
        }

        alert("다음 스테이지로 이동합니다!");
        // send stage log to server
        // update user quiz history

        setCurrentStage(currentStage + 1);
        setSelectedOptionId(null);
        setCurrentQuestionIndex(0);
        return;
      }

      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOptionId(null);
    } else {
      alert("틀렸습니다!");
      // send qeustion log to server
    }
  };

  const renderQuizPage = () => {
    const quizStage: QuizStageEx = quizSet.quizStages[currentStage];
    const question = quizStage.questions[currentQuestionIndex];
    const totalQuestions = quizStage.questions.length;
    const totalStages = quizSet.quizStages.length;

    return (
      <>
        <p>
          stage: {currentStage + 1}/{totalStages}
        </p>
        <p>
          question: {currentQuestionIndex + 1}/{totalQuestions}
        </p>
        <h3>{quizStage.name}</h3>
        <p>{question.text}</p>
        {question.options &&
          question.options.map((option: QuestionOption, index: number) => (
            <div key={option.id}>
              <input
                type="radio"
                name="option"
                value={option.id}
                checked={option.id === selectedOptionId}
                onChange={() => setSelectedOptionId(option.id)} // 선택된 옵션 업데이트
              />
              <label>
                {option.text}({option.isCorrect ? "o" : "x"})
              </label>
            </div>
          ))}
        <button
          onClick={() =>
            confirmAnswer(quizStage.id, question.id, selectedOptionId!)
          }
          disabled={selectedOptionId == null} // 선택된 옵션이 없으면 버튼 비활성화
        >
          확인
        </button>
      </>
    );
  };

  return <div>{renderQuizPage()}</div>;
}
