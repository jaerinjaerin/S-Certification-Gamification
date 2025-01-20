"use client";
import { useEffect, useState } from "react";
import { useUserContext } from "../../_provider/provider";
import { fetchData } from "../../../_lib/fetch";

const UserOutcome = () => {
  const { state } = useUserContext();
  const [data, setData] = useState({ score: [], time: [] });
  const [loading, setLoading] = useState({ score: true, time: true });

  useEffect(() => {
    if (state.fieldValues) {
      fetchData(
        state.fieldValues,
        "user/statistics/outcome/average-score",
        (data) => {
          console.log("🚀 ~ fetchData ~ data:", data);
          setData((v) => ({ ...v, score: data.result }));
          setLoading((v) => ({ ...v, score: false }));
        }
      );
      //
      fetchData(
        state.fieldValues,
        "user/statistics/outcome/total-quiz-completion-time",
        (data) => {
          console.log("🚀 ~ fetchData ~ data:", data);
          setData((v) => ({ ...v, time: data.result }));
          setLoading((v) => ({ ...v, time: false }));
        }
      );
      //
    }
  }, [state.fieldValues]);

  return <div className="border rounded-xl p-6">Outcome</div>;
};

export default UserOutcome;
