"use client";

import { useEffect, useState } from "react";
import { useQuizContext } from "../../_provider/provider";
import { fetchData } from "../../../_lib/fetch";

const QuizIncorrectAnswerRate = () => {
  const { state } = useQuizContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (state.fieldValues) {
      fetchData(
        state.fieldValues,
        "quiz/statistics/incorrect-answer-rate-by-category",
        (data) => {
          console.log("🚀 ~ fetchData ~ data:", data);
          setData(data.result);
          setLoading(false);
        }
      );
      //
    }
  }, [state.fieldValues]);

  return <div className="border rounded-xl p-6">Incorrect Answer Rate</div>;
};

export default QuizIncorrectAnswerRate;
