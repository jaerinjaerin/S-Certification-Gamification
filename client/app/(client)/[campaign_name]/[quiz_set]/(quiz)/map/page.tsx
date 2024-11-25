"use client";

import { useQuizHistory } from "@/providers/quiz_history_provider";
import { useQuiz } from "@/providers/quiz_provider";
import { usePathNavigator } from "@/route/usePathNavigator";

export default function QuizMap() {
  const { quizSet, language } = useQuiz();
  const { quizHistory, createHistory, loading } = useQuizHistory();
  const { routeToPage } = usePathNavigator();

  const routeNextQuizStage = async () => {
    routeToPage("quiz");
  };

  return (
    <div>
      <h1>Quiz Map</h1>
      {/* {campaign && <p>인증제: {campaign.name}</p>} */}
      {language && <p>언어: {language.name}</p>}
      {quizSet && <p>퀴즈 스테이지 개수: {quizSet.quizStages.length}</p>}
      <p>다음 Stage: {(quizHistory?.lastCompletedStage ?? 0) + 1}</p>
      <button onClick={routeNextQuizStage} disabled={loading}>
        Go Quiz
      </button>
    </div>
  );
}
