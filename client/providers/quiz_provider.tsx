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
import * as Sentry from "@sentry/nextjs";
import assert from "assert";
import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
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
  getAllStageMaxScore(): number;
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
  userId,
  quizSetPath,
}: {
  children: React.ReactNode;
  quizSet: QuizSetEx;
  language: Language;
  quizLog: UserQuizLog;
  quizStageLogs: UserQuizStageLog[];
  userId: string | undefined;
  quizSetPath: string;
}) => {
  const { campaign } = useCampaign();
  const [currentQuizSetPath, setCurrentQuizSetPath] =
    useState<string>(quizSetPath);
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
  >(quizSet.quizStages[currentQuizStageIndex]?.questions ?? []);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const quizScoreManagerRef = useRef(new QuizScoreManager()); // 유지되는 인스턴스
  const quizScoreManager = quizScoreManagerRef.current;

  const quizLogManagerRef = useRef(new QuizLogManager(currentQuizStageIndex)); // 유지되는 인스턴스
  const quizLogManager = quizLogManagerRef.current;

  const { data: session } = useSession();

  const isCreatingQuizLogRef = useRef(false); // 실행 상태를 추적

  console.log("QuizProvider session", session);

  // if (!quizLog) {
  //   try {
  //     const initHistoryResponse = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_URL}/api/logs/quizzes/sets/?quizset_path=${params.quizset_path}`,
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ userId }),
  //       }
  //     );
  //     if (!initHistoryResponse.ok) {
  //       console.error(
  //         "Failed to initialize quiz history:",
  //         initHistoryResponse
  //       );
  //       // redirectToErrorPage();
  //       return (
  //         <>
  //           {initHistoryResponse.status} {initHistoryResponse.statusText}
  //         </>
  //       );
  //     }
  //     const initHistoryData = await initHistoryResponse.json();
  //     quizLog = initHistoryData.item.quizLog;
  //     quizStageLogs = initHistoryData.item.quizStageLogs;
  //   } catch (error) {
  //     console.error("Failed to initialize quiz history:", error);
  //     // redirectToErrorPage();
  //     return <>{error}</>;
  //     return null;
  //   }
  // }

  console.log("QuizProvider quizLog", quizLog, userId);

  useEffect(() => {
    console.log("QuizProvider useEffect", userId, quizLog?.id);
    if (!quizLog) {
      createQuizLog();
    }
  }, [userId, quizLog?.id]);

  const createQuizLog = async () => {
    if (isCreatingQuizLogRef.current) {
      console.log("createQuizLog is already running");
      return; // 이미 실행 중인 경우 종료
    }

    isCreatingQuizLogRef.current = true; // 실행 상태 설정
    try {
      console.log("createQuizLog started", userId);
      const initHistoryResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/logs/quizzes/sets/?quizset_path=${currentQuizSetPath}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }
      );

      if (!initHistoryResponse.ok) {
        console.error(
          "Failed to initialize quiz history:",
          initHistoryResponse
        );
        return;
      }

      const initHistoryData = await initHistoryResponse.json();
      const newQuizLog = initHistoryData.item.quizLog;
      const newQuizStageLogs = initHistoryData.item.quizStageLogs;

      setQuizLog(newQuizLog);
      setQuizStageLogs(newQuizStageLogs);
    } catch (error) {
      console.error("Failed to initialize quiz history:", error);
      Sentry.captureException(error);
    } finally {
      isCreatingQuizLogRef.current = false; // 실행 상태 해제
    }
  };

  const endStage = async (remainingHearts: number): Promise<EndStageResult> => {
    const score = quizScoreManager.calculateStageScore({
      quizLogs: quizLogManager.getLogs(),
      remainingHearts: remainingHearts,
    });
    const totalScore = quizStagesTotalScore + score;

    console.info("score", score);

    const totalElapsedSeconds = quizLogManager.getTotalElapsedSeconds();
    setIsLoading(true);

    let badgeStage = isBadgeStage();
    let isBadgeAcquired = false;
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

    setQuizStagesTotalScore(totalScore);
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
      Sentry.captureException(error);
      return false;
    }
  };

  const postActivitieRegister = async (activityId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/sumtotal/activity/register`,
        {
          method: "PUT",
          cache: "no-store",
          body: JSON.stringify({
            activityId: activityId,
          }),
        }
      );

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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/sumtotal/activity/end`,
        {
          method: "POST",
          cache: "no-store",
          body: JSON.stringify({
            activityId: activityId,
            status: "Attended",
            elapsedSeconds: elapsedSeconds,
          }),
        }
      );

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
        subsidaryId: quizLog.subsidaryId,
        quizStageIndex: currentQuizStageIndex,
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
      Sentry.captureException(error);
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
      subsidaryId: quizLog.subsidaryId,
      quizStageIndex: currentQuizStageIndex,
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
          await fetch(
            `${process.env.NEXT_PUBLIC_BASE_PATH}/api/logs/quizzes/questions`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(quizLog),
            }
          );
        })
      );
    } catch (error) {
      console.error("Error createQuizQuestionLogs:", error);
      Sentry.captureException(error);
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/logs/quizzes/stages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: _quizLog.userId,
            jobId: _quizLog.jobId || "",
            quizSetId: quizSet.id,
            quizStageIndex: currentQuizStageIndex,
            quizStageId: currentQuizStage.id,
            isCompleted: true,
            isBadgeStage,
            isBadgeAcquired,
            badgeActivityId,
            remainingHearts,
            score,
            elapsedSeconds,
            campaignId: campaign.id,
            domainId: quizLog.domainId,
            languageId: language.id,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch user profile");
      }

      const data = await response.json();
      return data.item as UserQuizStageLog;
    } catch (error) {
      console.error("Error createQuizStageLog:", error);
      Sentry.captureException(error);
      throw new Error(
        "An unexpected error occurred while registering quiz log"
      );
    }
  };

  const updateQuizStageCompleteLog = async (
    quizStageIndex: number,
    isBadgeAcquired: boolean
  ): Promise<UserQuizLog> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/logs/quizzes/sets/${_quizLog.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lastCompletedStage: quizStageIndex + 1,
            isBadgeAcquired,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch user profile");
      }

      const data = await response.json();
      return data.item as UserQuizLog;
    } catch (error) {
      console.error("Error updateQuizStageCompleteLog:", error);
      Sentry.captureException(error);
      throw new Error(
        "An unexpected error occurred while registering quiz log"
      );
    }
  };

  const sendQuizCompleteLog = async () => {
    //
  };

  // TODO: 실제 계산로직으로 변경해야함.
  const getAllStageMaxScore = () => {
    return 2000;
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
        getAllStageMaxScore,
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
