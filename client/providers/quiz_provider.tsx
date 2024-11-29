"use client";

import {
  CampaignDomainQuizSetEx,
  QuestionEx,
  QuizStageEx,
} from "@/app/types/type";
import { areArraysEqualUnordered } from "@/utils/validationUtils";
import {
  Campaign,
  Domain,
  Language,
  Question,
  QuestionOption,
  QuestionType,
  UserCampaignDomainLog,
} from "@prisma/client";
import { createContext, useContext, useState } from "react";

interface QuizContextType {
  quizSet: CampaignDomainQuizSetEx | null;
  language: Language | null;
  // domain: Domain | null;
  // campaign: Campaign | null;
  quizHistory: UserCampaignDomainLog | null;
  currentQuizStageIndex: number;
  currentQuestionIndex: number;
  // currentQuestionOptionIndex: number;
  currentQuizStage: QuizStageEx | null;
  currentStageQuizzes: QuestionEx[] | null;
  isFirstBadgeStage(): boolean;
  isLastBadgeStage(): boolean;
  processFirstBadgeAcquisition(): void;
  processLastBadgeAcquisition(): void;
  isComplete(): boolean;
  isLastQuestionOnState(): boolean;
  isLastStage(): boolean;
  startStage(): void;
  endStage(): Promise<void>;
  nextQuestion(): boolean;
  nextStage(): boolean;
  canNextQuestion(): boolean;
  confirmAnswer(
    quizStageId: string,
    questionId: string,
    selectedOptionIds: string[]
  ): Promise<confirmAnswerResponse>;
  // setCurrentQuestionOptionIds: React.Dispatch<React.SetStateAction<string>>;
}

interface confirmAnswerResponse {
  isCorrect: boolean;
  questionType: QuestionType;
  correctOptions: number[];
  message: string;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider = ({
  children,
  quizSet,
  language,
  quizHistory,
}: {
  children: React.ReactNode;
  quizSet: CampaignDomainQuizSetEx;
  language: Language;
  quizHistory: UserCampaignDomainLog;
  domain: Domain;
  campaign: Campaign;
}) => {
  const [currentQuizStageIndex, setCurrentQuizStageIndex] = useState(
    quizHistory?.lastCompletedStage ?? 0
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // const [currentQuestionOptionIndex, setCurrentQuestionOptionIndex] =
  //   useState(0);
  const [currentQuizStage, setCurrentQuizStage] = useState<QuizStageEx | null>(
    quizSet.quizStages[currentQuizStageIndex]
  );
  const [currentStageQuizzes, setCurrentStageQuizzes] = useState<
    QuestionEx[] | null
  >(quizSet.quizStages[currentQuizStageIndex].questions);
  let stageStartedAt: Date | null = null;

  const startStage = (): void => {
    stageStartedAt = new Date();
  };

  const endStage = async (): Promise<void> => {
    const elapsedSeconds = Math.floor(
      // 소수점 버림
      (new Date().getTime() - stageStartedAt!.getTime()) / 1000
    );

    /**
     * send log
     */

    if (!isLastStage()) {
      const nextQuizStageIndex = currentQuizStageIndex + 1;
      setCurrentQuizStageIndex(nextQuizStageIndex);
      setCurrentQuizStage(quizSet.quizStages[nextQuizStageIndex]);
      setCurrentStageQuizzes(quizSet.quizStages[nextQuizStageIndex].questions);
      setCurrentQuestionIndex(0);
    }

    stageStartedAt = null;
  };

  const isLastQuestionOnState = (): boolean => {
    return currentQuizStage?.questions.length - 1 === currentQuestionIndex;
  };

  const canNextQuestion = (): boolean => {
    if (isLastQuestionOnState()) {
      return false;
    }
    return true;
  };

  const nextQuestion = (): boolean => {
    console.log("nextQuestion", currentQuestionIndex);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    return true;
  };

  const nextStage = (): boolean => {
    if (isLastStage()) {
      return false;
    }
    const nextQuizStageIndex = currentQuizStageIndex + 1;
    setCurrentQuizStageIndex(nextQuizStageIndex);
    setCurrentQuizStage(quizSet.quizStages[nextQuizStageIndex]);
    setCurrentStageQuizzes(quizSet.quizStages[nextQuizStageIndex].questions);
    setCurrentQuestionIndex(0);
    return true;
  };

  // const getCurrentStageQuizzes = (): QuizQuestion[] => {
  //   if (quizSet.quizStages.length <= currentQuizStageIndex) {
  //     return [];
  //   }
  //   return quizSet.quizStages[currentQuizStageIndex].questions;
  // };

  const isFirstBadgeStage = (): boolean => {
    if (
      quizSet.isFirstBadgeStage == null ||
      quizSet.firstBadgeActivityId == null
    ) {
      return false;
    }
    return quizSet.isFirstBadgeStage === currentQuizStageIndex;
  };

  const isLastBadgeStage = (): boolean => {
    if (quizSet.lastBadgeActivityId == null) {
      return false;
    }
    return quizSet.quizStages.length - 1 === currentQuizStageIndex;
  };

  const processFirstBadgeAcquisition = () => {
    // fsm 처리 로직
  };

  const processLastBadgeAcquisition = () => {
    // ff 처리 로직
    // fsm 처리 로직
  };

  const isComplete = (): boolean => {
    return quizHistory.isCompleted ?? false;
  };

  const isLastStage = (): boolean => {
    return quizSet.quizStages.length - 1 === currentQuizStageIndex;
  };

  const confirmAnswer = async (
    quizStageId: string,
    questionId: string,
    selectedOptionIds: string[]
  ): Promise<confirmAnswerResponse> => {
    const question = currentQuizStage?.questions.find(
      (q: Question) => q.id === questionId
    );

    if (!question) {
      return {
        isCorrect: false,
        questionType: QuestionType.SINGLE_CHOICE,
        correctOptions: [],
        message: "Question not found",
      };
    }

    const correctOptionIds = question.options
      .filter((option: QuestionOption) => option.isCorrect)
      .map((option: QuestionOption) => option.id);

    console.log("correctOptions", correctOptionIds, selectedOptionIds);
    if (areArraysEqualUnordered(correctOptionIds, selectedOptionIds)) {
      return {
        isCorrect: true,
        questionType: question.type,
        correctOptions: correctOptionIds,
        message: "정답입니다!",
      };
    }

    return {
      isCorrect: false,
      questionType: question.type,
      correctOptions: correctOptionIds,
      message: "틀렸습니다!",
    };
  };

  const sendQuestionLog = async (
    questionId: string,
    selectedOptionId: string,
    isCorrect: boolean,
    elapsedSeconds: number
  ) => {
    // 맞췄는지 틀렸는지
  };

  const sendQuizStageLog = async (
    stageIncex: number,
    elapsedSeconds: number
  ) => {
    //
  };

  const sendQuizStageCompleteLog = async (
    stageIncex: number,
    elapsedSeconds: number
  ) => {
    //
  };
  const sendQuizCompleteLog = async () => {
    //
  };

  return (
    <QuizContext.Provider
      value={{
        quizSet,
        language,
        quizHistory,
        currentQuizStageIndex,
        currentQuestionIndex,
        currentQuizStage,
        currentStageQuizzes,
        isFirstBadgeStage,
        isLastBadgeStage,
        processFirstBadgeAcquisition,
        processLastBadgeAcquisition,
        isComplete,
        isLastStage,
        startStage,
        endStage,
        nextStage,
        confirmAnswer,
        isLastQuestionOnState,
        nextQuestion,
        canNextQuestion,
        // currentQuestionOptionIndex,
        // setCurrentQuestionOptionIndex,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error("useQuiz는 QuizProvider 내에서만 사용할 수 있습니다.");
  }
  return context;
};
