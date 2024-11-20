"use client";

import { useQuizHistory } from "@/providers/quiz_history_provider";
import { useQuiz } from "@/providers/quiz_provider";

export default function QuizIntro() {
  const { quizSet, language, campaign } = useQuiz();
  const { quizHistory, createHistory, loading } = useQuizHistory();

  const routeQuizMap = async () => {
    if (quizHistory == null) {
      const result = await createHistory();
      if (!result) {
        return;
      }
    }

    const currentUrl = new URL(window.location.href);
    const queryString = currentUrl.search;
    const targetUrl = `/map${queryString}`;
    window.location.href = targetUrl;
  };

  return (
    <div>
      <h1>Intro (Sumtotal)</h1>
      {campaign && <p>인증제: {campaign.name}</p>}
      {language && <p>언어: {language.name}</p>}
      {quizSet && <p>퀴즈 스테이지 개수: {quizSet.quizStages.length}</p>}
      <p>다음 Stage: {(quizHistory?.lastCompletedStage ?? 0) + 1}</p>
      <button onClick={routeQuizMap} disabled={loading}>
        Go Quiz Map
      </button>
    </div>
  );
}
