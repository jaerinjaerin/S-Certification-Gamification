"use client";
import { useEffect, useState } from "react";
import { useQuizContext } from "../../_provider/provider";
import { fetchData } from "../../../_lib/fetch";

const QuizQuizzesRanked = () => {
  const { state } = useQuizContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (state.fieldValues) {
      fetchData(
        state.fieldValues,
        "quiz/statistics/quizzes-ranked-by-highest-incorrect-answer-rate",
        (data) => {
          console.log("🚀 ~ fetchData ~ data:", data);
          setData(data.result);
          setLoading(false);
        }
      );
      //
    }
  }, [state.fieldValues]);

  return <div className="border rounded-xl p-6">Quizzes Ranked</div>;
};

export default QuizQuizzesRanked;
