"use client";

import {
  Campaign,
  Domain,
  Language,
  UserCampaignDomainLog,
} from "@prisma/client";
import { createContext, useContext, useMemo } from "react";

interface QuizHistoryContextType {
  quizHistory: UserCampaignDomainLog | null;
  domain: Domain;
  campaign: Campaign;
  language: Language;
}

const QuizHistoryContext = createContext<QuizHistoryContextType | undefined>(
  undefined
);

export const QuizHistoryProvider = ({
  children,
  quizHistory,
  domain,
  campaign,
  language,
}: {
  children: React.ReactNode;
  quizHistory: UserCampaignDomainLog;
  domain: Domain;
  campaign: Campaign;
  language: Language;
}) => {
  const sendQuizStartLog = async ({}) => {
    //
  };

  const sendQuestionLog = async (
    isCorrect: boolean,
    elapsedSeconds: number
  ) => {
    // 맞췄는지 틀렸는지
  };

  const sendQuizStageLog = async () => {
    //
  };

  const sendQuizCompleteLog = async () => {
    //
  };

  const contextValue = useMemo(
    () => ({
      quizHistory,
      domain,
      campaign,
      language,
    }),
    [quizHistory] // 필요한 경우만 새로 생성
  );

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
