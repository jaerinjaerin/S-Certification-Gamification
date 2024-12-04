"use client";

import { useQuiz } from "@/providers/quiz_provider";
import { usePathNavigator } from "@/route/usePathNavigator";

export default function QuizMap() {
  const { quizSet, language, quizHistory } = useQuiz();
  const { routeToPage } = usePathNavigator();

  const routeNextQuizStage = async () => {
    routeToPage("quiz");
  };

  return (
    <div>
      <h1>Quiz Map</h1>
      {language && <p>언어: {language.name}</p>}
      {quizSet && <p>퀴즈 스테이지 개수: {quizSet.quizStages.length}</p>}
      <p>다음 Stage: {(quizHistory?.lastCompletedStage ?? 0) + 1}</p>
      <button onClick={routeNextQuizStage}>Go Quiz</button>
    </div>
  );
}
