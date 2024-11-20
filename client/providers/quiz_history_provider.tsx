"use client";

import { UserCampaignDomainLog } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface QuizHistoryContextType {
  quizHistory: UserCampaignDomainLog | null;
  createHistory: () => Promise<boolean>;
  loading: boolean;
}

const QuizHistoryContext = createContext<QuizHistoryContextType | undefined>(
  undefined
);

export const QuizHistoryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [quizHistory, setQuizHistory] = useState<UserCampaignDomainLog | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const quizsetId = searchParams.get("quizset_id");
  const { data: session } = useSession();

  console.log("QuizHistoryProvider session", session);

  useEffect(() => {
    console.log("QuizHistoryProvider useEffect", session);
    if (session) {
      fetchHistory();
    }
  }, [session]);

  const createHistory = async (): Promise<boolean> => {
    try {
      // setLoading(true);
      const response = await fetch(
        `/api/user/${session?.user.id}/quizset/${quizsetId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        console.error("response", response);
        return false;
      }

      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      // setLoading(false);
    }
  };

  const fetchHistory = async () => {
    console.log("QuizHistoryProvider fetchData", quizsetId);
    try {
      // setLoading(true);
      const response = await fetch(
        `/api/user/${session?.user.id}/quiz_set/${quizsetId}`,
        {
          cache: "no-cache",
        }
      );

      console.log("QuizHistoryProvider response", response);

      if (!response.ok) {
        console.error("response", response);
        return;
      }
      const data = await response.json();

      console.log("QuizHistoryProvider fetchData data", data);
      setQuizHistory(data.item);
    } catch (error) {
      console.error(error);
    } finally {
      // setLoading(false);
    }
  };

  const contextValue = useMemo(
    () => ({
      quizHistory,
      createHistory,
      loading,
    }),
    [quizHistory, createHistory, loading] // 필요한 경우만 새로 생성
  );

  // if (loading) {
  //   return <div>Loading...</div>; // 로딩 화면
  // }

  // if (error) {
  //   return <div>{error}</div>; // 에러 메시지
  // }

  return (
    <QuizHistoryContext.Provider value={contextValue}>
      {children}
    </QuizHistoryContext.Provider>
  );
};

export const useQuizHistory = () => {
  const context = useContext(QuizHistoryContext);
  if (context === undefined) {
    throw new Error(
      "useQuizHistory QuizHistoryProvider 내에서만 사용할 수 있습니다."
    );
  }
  return context;
};
