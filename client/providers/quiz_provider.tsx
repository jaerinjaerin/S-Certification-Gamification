"use client";

import { QuestionEx, QuizSetEx, QuizStageEx } from "@/app/types/type";
import { areArraysEqualUnordered } from "@/utils/validationUtils";
import {
  Language,
  Question,
  QuestionOption,
  QuestionType,
  UserQuizLog,
  UserQuizStageLog,
} from "@prisma/client";
import assert from "assert";
import { createContext, useContext, useRef, useState } from "react";
import { useCampaign } from "./campaignProvider";
import QuizLogManager, { QuizLog } from "./managers/quizLogManager";
import QuizScoreManager from "./managers/quizScoreManager";

interface QuizContextType {
  quizSet: QuizSetEx | null;
  quizStageLogs: UserQuizStageLog[];
  language: Language | null;
  quizLog: UserQuizLog | null;
  currentQuizStageIndex: number;
  currentQuestionIndex: number;
  currentQuizStage: QuizStageEx | null;
  currentStageQuestions: QuestionEx[] | null;
  isBadgeStage(): boolean;
  processBadgeAcquisition(elapsedSeconds: number): Promise<boolean>;
  isComplete(): boolean;
  isLastQuestionOnState(): boolean;
  isLastStage(): boolean;
  endStage(remainingHearts: number): Promise<EndStageResult>;
  nextQuestion(): boolean;
  nextStage(): boolean;
  canNextQuestion(): boolean;
  confirmAnswer(
    questionId: string,
    selectedOptionIds: string[],
    elapsedSeconds: number
  ): ConfirmAnswerResponse;
  logUserAnswer(
    questionId: string,
    selectedOptionIds: string[],
    elapsedSeconds: number,
    isCorrect: boolean
  ): void;
  getCorrectOptionIds(questionId: string): string[];
  isLoading: boolean;
  quizStagesTotalScore: number;
}

interface ConfirmAnswerResponse {
  isCorrect: boolean;
  questionType: QuestionType;
  correctOptionIds: string[];
  message: string;
}

export interface EndStageResult {
  score: number;
  isBadgeAcquired: boolean;
  badgeStage: boolean;
  badgeImageURL: string;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider = ({
  children,
  quizSet,
  language,
  quizLog,
  quizStageLogs,
}: {
  children: React.ReactNode;
  quizSet: QuizSetEx;
  language: Language;
  quizLog: UserQuizLog;
  quizStageLogs: UserQuizStageLog[];
}) => {
  const { campaign } = useCampaign();
  const [_quizLog, setQuizLog] = useState<UserQuizLog>(quizLog);
  const [_quizStageLogs, setQuizStageLogs] = useState<UserQuizStageLog[]>(
    quizStageLogs ?? []
  );
  const [quizStagesTotalScore, setQuizStagesTotalScore] = useState<number>(
    (quizStageLogs ?? []).reduce(
      (total, stageLog: UserQuizStageLog) => total + (stageLog.score ?? 0),
      0
    )
  );
  const [currentQuizStageIndex, setCurrentQuizStageIndex] = useState(
    quizLog?.lastCompletedStage ?? 0
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuizStage, setCurrentQuizStage] = useState<QuizStageEx | null>(
    quizSet.quizStages[currentQuizStageIndex]
  );
  const [currentStageQuestions, setCurrentStageQuestions] = useState<
    QuestionEx[] | null
  >(quizSet.quizStages[currentQuizStageIndex].questions);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const quizScoreManagerRef = useRef(new QuizScoreManager()); // 유지되는 인스턴스
  const quizScoreManager = quizScoreManagerRef.current;

  const quizLogManagerRef = useRef(new QuizLogManager(currentQuizStageIndex)); // 유지되는 인스턴스
  const quizLogManager = quizLogManagerRef.current;

  const endStage = async (remainingHearts: number): Promise<EndStageResult> => {
    const score = quizScoreManager.calculateStageScore({
      quizLogs: quizLogManager.getLogs(),
      remainingHearts: remainingHearts,
    });

    console.info("score", score);

    const totalElapsedSeconds = quizLogManager.getTotalElapsedSeconds();
    setIsLoading(true);

    let isBadgeAcquired = false;
    let badgeStage = isBadgeStage();
    if (badgeStage) {
      isBadgeAcquired = await processBadgeAcquisition(totalElapsedSeconds);
    }

    await createQuizQuestionLogs(quizLogManager.getLogs());
    const quizStageLog: UserQuizStageLog = await createQuizStageLog(
      score,
      totalElapsedSeconds,
      remainingHearts,
      badgeStage,
      isBadgeAcquired,
      getCurrentStageBadgeActivityId()
    );

    setQuizStagesTotalScore(quizStagesTotalScore + score);
    setQuizStageLogs([..._quizStageLogs, quizStageLog]);

    const quizLog: UserQuizLog = await updateQuizStageCompleteLog(
      currentQuizStageIndex,
      badgeStage
    );
    setQuizLog(quizLog);

    quizLogManager.endStage();

    setIsLoading(false);

    return {
      score: quizStageLog.score ?? 0,
      isBadgeAcquired: isBadgeAcquired,
      badgeStage: badgeStage,
      badgeImageURL: currentQuizStage?.badgeImageURL ?? "",
    };
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
    setCurrentStageQuestions(quizSet.quizStages[nextQuizStageIndex].questions);
    setCurrentQuestionIndex(0);

    quizLogManager.startStage(nextQuizStageIndex);
    return true;
  };

  const isBadgeStage = (): boolean => {
    return currentQuizStage.isBadgeStage;
  };

  const getCurrentStageBadgeActivityId = (): string | null => {
    return currentQuizStage.badgeActivityId;
  };

  const processBadgeAcquisition = async (
    elapsedSeconds: number
  ): Promise<boolean> => {
    // call sumtotal badge api
    const activityId = getCurrentStageBadgeActivityId();
    if (!activityId) {
      return false;
    }

    try {
      await postActivitieRegister(activityId);
      await postActivitieEnd(activityId, elapsedSeconds);
      return true;
    } catch (error) {
      return false;
    }
  };

  const postActivitieRegister = async (activityId: string) => {
    try {
      const response = await fetch("/api/sumtotal/activity/register", {
        method: "PUT",
        cache: "no-store",
        body: JSON.stringify({
          activityId: activityId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch activities");
      }

      const data = await response.json();
    } catch (err: any) {
      console.error(err.message || "An unexpected error occurred");
      throw new Error(err.message || "An unexpected error occurred");
    }
  };

  const postActivitieEnd = async (
    activityId: string,
    elapsedSeconds: number
  ) => {
    try {
      const response = await fetch("/api/sumtotal/activity/end", {
        method: "POST",
        cache: "no-store",
        body: JSON.stringify({
          activityId: activityId,
          status: "Attended",
          elapsedSeconds: elapsedSeconds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch activities");
      }

      const data = await response.json();
      console.log("data", data);
    } catch (err: any) {
      console.error(err.message || "An unexpected error occurred");
      throw new Error(err.message || "An unexpected error occurred");
    }
  };

  const isComplete = (): boolean => {
    return _quizLog.isCompleted ?? false;
  };

  const isLastStage = (): boolean => {
    return quizSet.quizStages.length - 1 === currentQuizStageIndex;
  };

  const confirmAnswer = (
    questionId: string,
    selectedOptionIds: string[],
    elapsedSeconds: number
  ): ConfirmAnswerResponse => {
    try {
      const question = currentQuizStage?.questions.find(
        (q: Question) => q.id === questionId
      );

      if (!question) {
        throw new Error("Question not found");
      }

      const correctOptionIds = question.options
        .filter((option: QuestionOption) => option.isCorrect)
        .map((option: QuestionOption) => option.id);

      const isCorrect = areArraysEqualUnordered(
        correctOptionIds,
        selectedOptionIds
      );
      const result = {
        isCorrect: isCorrect,
        questionType: question.questionType,
        correctOptionIds: correctOptionIds,
        message: isCorrect ? "정답입니다!" : "틀렸습니다!",
      };

      quizLogManager.addLog({
        isCorrect: result.isCorrect,
        campaignId: campaign.id,
        userId: _quizLog.userId,
        jobId: _quizLog.jobId || "",
        quizSetId: quizSet.id,
        questionId: questionId,
        languageId: language.id,
        selectedOptionIds: selectedOptionIds,
        correctOptionIds: result.correctOptionIds,
        domainId: quizLog.domainId,
        stageIndex: currentQuizStageIndex,
        category: question.category,
        specificFeature: question.specificFeature,
        product: question.product,
        questionType: question.questionType,
        elapsedSeconds: elapsedSeconds,
        quizStageId: currentQuizStage.id,
        createdAt: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      throw error;
    }
  };

  const logUserAnswer = (
    questionId: string,
    selectedOptionIds: string[],
    elapsedSeconds: number,
    isCorrect: boolean
  ): void => {
    const question = currentQuizStage?.questions.find(
      (q: Question) => q.id === questionId
    );

    if (!question) {
      assert(false, "Question not found");
    }

    const correctOptionIds = question.options
      .filter((option: QuestionOption) => option.isCorrect)
      .map((option: QuestionOption) => option.id);

    quizLogManager.addLog({
      isCorrect,
      campaignId: campaign.id,
      userId: _quizLog.userId,
      jobId: _quizLog.jobId || "",
      quizSetId: quizSet.id,
      questionId: questionId,
      languageId: language.id,
      selectedOptionIds: selectedOptionIds,
      correctOptionIds: correctOptionIds,
      domainId: quizLog.domainId,
      stageIndex: currentQuizStageIndex,
      category: question.category,
      specificFeature: question.specificFeature,
      product: question.product,
      questionType: question.questionType,
      elapsedSeconds: elapsedSeconds,
      quizStageId: currentQuizStage.id,
      createdAt: new Date().toISOString(),
    });
  };

  const getCorrectOptionIds = (questionId: string): string[] => {
    const question = currentQuizStage?.questions.find(
      (q: Question) => q.id === questionId
    );

    if (!question) {
      throw new Error("Question not found");
    }

    return question.options
      .filter((option: QuestionOption) => option.isCorrect)
      .map((option: QuestionOption) => option.id);
  };

  const createQuizQuestionLogs = async (quizLogs: QuizLog[]): Promise<void> => {
    try {
      const result = Promise.all(
        quizLogs.map(async (quizLog) => {
          await fetch("/api/logs/quizzes/questions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(quizLog),
          });
        })
      );
    } catch (error) {
      console.error("Error createQuizQuestionLogs:", error);
      throw new Error(
        "An unexpected error occurred while registering quiz log"
      );
    }
  };

  const createQuizStageLog = async (
    score,
    elapsedSeconds,
    remainingHearts: number,
    isBadgeStage: boolean,
    isBadgeAcquired: boolean,
    badgeActivityId: string | null = null
  ): Promise<UserQuizStageLog> => {
    try {
      const response = await fetch("/api/logs/quizzes/stages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId: campaign.id,
          userId: _quizLog.userId,
          jobId: _quizLog.jobId || "",
          domainId: quizLog.domainId,
          quizSetId: quizSet.id,
          stageIndex: currentQuizStageIndex,
          quizStageId: currentQuizStage.id,
          isCompleted: true,
          isBadgeStage,
          isBadgeAcquired,
          badgeActivityId,
          remainingHearts,
          score,
          elapsedSeconds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch user profile");
      }

      const data = await response.json();
      return data.item as UserQuizStageLog;
    } catch (error) {
      console.error("Error createQuizStageLog:", error);
      throw new Error(
        "An unexpected error occurred while registering quiz log"
      );
    }
  };

  const updateQuizStageCompleteLog = async (
    stageIndex: number,
    isBadgeAcquired: boolean
  ): Promise<UserQuizLog> => {
    try {
      const response = await fetch(`/api/logs/quizzes/sets/${_quizLog.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lastCompletedStage: stageIndex + 1,
          isBadgeAcquired,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch user profile");
      }

      const data = await response.json();
      return data.item as UserQuizLog;
    } catch (error) {
      console.error("Error updateQuizStageCompleteLog:", error);
      throw new Error(
        "An unexpected error occurred while registering quiz log"
      );
    }
  };

  const sendQuizCompleteLog = async () => {
    //
  };

  return (
    <QuizContext.Provider
      value={{
        quizSet,
        quizStageLogs: _quizStageLogs,
        language,
        quizLog: _quizLog,
        currentQuizStageIndex,
        currentQuestionIndex,
        currentQuizStage,
        currentStageQuestions,
        isComplete,
        isLastStage,
        endStage,
        nextStage,
        confirmAnswer,
        logUserAnswer,
        isLastQuestionOnState,
        nextQuestion,
        canNextQuestion,
        isBadgeStage,
        processBadgeAcquisition,
        getCorrectOptionIds,
        isLoading,
        quizStagesTotalScore,
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
