"use client";
import { QuestionEx, QuizSetEx, QuizStageEx } from "@/types/apiTypes";
import { EndStageResult, ScoreData } from "@/types/type";
import {
  AuthType,
  Question,
  QuestionOption,
  UserQuizLog,
  UserQuizStageLog,
} from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { useTranslations } from "next-intl";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useCampaign } from "./campaignProvider";
import { QuizBadgeHandler } from "./managers/quizBadgeHandler";
import { QuizLogHandler } from "./managers/quizLogHandler";
import QuizQuestionLogManager from "./managers/quizQuestionLogManager";
import { QuizScoreHandler } from "./managers/quizScoreHandler";
import { QuizStageLogHandler } from "./managers/quizStageLogHandler";

interface QuizContextType {
  userId: string;
  quizSet: QuizSetEx;
  quizLog: UserQuizLog | null;
  quizStageLogs: UserQuizStageLog[];
  currentQuizStageIndex: number;
  currentQuestionIndex: number;
  currentQuizStage: QuizStageEx | null;
  currentStageQuestions: QuestionEx[];
  lastCompletedQuizStage: QuizStageEx | null;
  isBadgeStage(): boolean;
  isComplete(): boolean;
  isLastQuestionOnState(): boolean;
  finalizeCurrentStage(remainingHearts: number): Promise<EndStageResult>;
  handleStageFailure(): Promise<void>;
  logUserAnswer(
    questionId: string,
    selectedOptionIds: string[],
    elapsedSeconds: number,
    isCorrect: boolean
  ): void;
  isLoading: boolean;
  quizStagesTotalScore: number;
  getAllStageMaxScore(): number;
  clearUserAnswerLogs(): void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider = ({
  campaignName,
  userId,
  authType,
  children,
  quizSet,
  quizLog,
  quizStageLogs,
  quizSetPath,
}: {
  campaignName: string;
  userId: string;
  authType: AuthType;
  children: React.ReactNode;
  quizSetPath: string;
  quizSet: QuizSetEx;
  quizLog: UserQuizLog | null;
  quizStageLogs: UserQuizStageLog[] | null;
}) => {
  const translation = useTranslations();

  const { campaign } = useCampaign();
  const [_quizLog, setQuizLog] = useState<UserQuizLog | null>(quizLog);

  // 네트워크 오류로 인해 quizStageLog만 저장되고 quizLog가 저장되지 않은 경우에 대한 처리 추가
  const [_quizStageLogs, setQuizStageLogs] = useState<UserQuizStageLog[]>(
    quizStageLogs != null
      ? quizStageLogs.filter(
          (log) => log.quizStageIndex <= (_quizLog?.lastCompletedStage ?? -1)
        )
      : []
  );

  const getQuizStagesTotalScore = (stageLogs: UserQuizStageLog[] | null) => {
    if (stageLogs == null) {
      return 0;
    }

    const quizStageIndex =
      quizLog?.lastCompletedStage == null ? -1 : quizLog?.lastCompletedStage;

    const filteredQuizStageLogs = stageLogs.filter(
      (log) => log.quizStageIndex <= quizStageIndex
    );
    const score = filteredQuizStageLogs.reduce(
      (total, stageLog: UserQuizStageLog) => {
        return total + (stageLog.score ?? 0);
      },
      0
    );

    console.log("getQuizStagesTotalScore", quizStageIndex, score);

    return score;
  };

  const [quizStagesTotalScore, setQuizStagesTotalScore] = useState<number>(
    getQuizStagesTotalScore(quizStageLogs)
  );

  const [currentQuizStageIndex, setCurrentQuizStageIndex] = useState(
    quizLog?.lastCompletedStage == null ? 0 : quizLog?.lastCompletedStage + 1
    // quizLog?.lastCompletedStage == null
    //   ? 0
    //   : Math.min(quizLog?.lastCompletedStage + 1, quizSet.quizStages.length - 1)
  );

  // TODO: 방어 코드. 코드가 정리되면 제거
  // if (
  //   currentQuizStageIndex >= quizSet.quizStages.length &&
  //   pathname.includes("/quiz")
  // ) {
  //   // redirect(`/${campaignName}/${quizSetPath}/map`);
  //   console.log(
  //     "redirect to map",
  //     currentQuizStageIndex,
  //     quizSet.quizStages.length
  //   );
  //   router.push("map");
  // }

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuizStage, setCurrentQuizStage] = useState<QuizStageEx | null>(
    quizSet.quizStages.length > currentQuizStageIndex
      ? quizSet.quizStages[currentQuizStageIndex]
      : null
  );
  const [lastCompletedQuizStage, setLastCompletedQuizStage] =
    useState<QuizStageEx | null>(
      quizLog?.lastCompletedStage != null
        ? quizSet.quizStages[quizLog?.lastCompletedStage]
        : null
    );
  const [currentStageQuestions, setCurrentStageQuestions] = useState<
    QuestionEx[]
  >(quizSet.quizStages[currentQuizStageIndex]?.questions ?? []);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const quizQuestionLogManagerRef = useRef(
    new QuizQuestionLogManager(currentQuizStageIndex)
  ); // 유지되는 인스턴스
  const quizQuestionLogManager = quizQuestionLogManagerRef.current;

  const isCreatingQuizLogRef = useRef(false); // 실행 상태를 추적

  // console.log("QuizProvider", quizSet);

  useEffect(() => {
    console.log("currentQuizStageIndex가 업데이트됨:", currentQuizStageIndex);
  }, [currentQuizStageIndex]);

  useEffect(() => {
    console.log("currentQuizStage 업데이트됨:", currentQuizStage);
  }, [currentQuizStage]);

  useEffect(() => {
    console.log("currentStageQuestions 업데이트됨:", currentStageQuestions);
  }, [currentStageQuestions]);

  useEffect(() => {
    // console.log("QuizProvider useEffect", userId, _quizLog?.id);
    if (!_quizLog) {
      createQuizLog();
    }
  }, [userId, _quizLog?.id]);

  const createQuizLog = async () => {
    if (isCreatingQuizLogRef.current) {
      // console.log("createQuizLog is already running");
      return; // 이미 실행 중인 경우 종료
    }

    isCreatingQuizLogRef.current = true; // 실행 상태 설정

    const quizLogHandler = new QuizLogHandler();
    const newQuizLog = await quizLogHandler.create({
      userId,
      quizSetPath: quizSetPath,
    });

    if (newQuizLog) {
      setQuizLog(newQuizLog);
    }

    isCreatingQuizLogRef.current = false;
  };

  const finalizeCurrentStage = async (
    remainingHearts: number
  ): Promise<EndStageResult> => {
    try {
      const quizScoreHandler = new QuizScoreHandler();

      // 현재 스테이지의 점수 계산
      const score = quizScoreHandler.calculateStageScore(
        quizQuestionLogManager.getLogs(),
        remainingHearts
      );
      const totalQuizScore = quizStagesTotalScore + score;

      // 현재 스테이지의 총 소요시간 계산
      const stageElapsedSeconds =
        quizQuestionLogManager.getTotalElapsedSeconds();
      const totalQuizTime = getQuizTotalElapsedSeconds() + stageElapsedSeconds;

      setIsLoading(true);

      // 뱃지 스테이지 여부 확인
      const isBadgeAcquired = isBadgeStage()
        ? await processBadgeAcquisition(stageElapsedSeconds)
        : false;

      // 랭킹 및 그래프 데이터 가져오기
      let scoreData: ScoreData | null = null;
      if (isBadgeStage() || isLastStage()) {
        scoreData = await quizScoreHandler.fetchRankAndGraphData(
          authType,
          campaign.id,
          currentQuizStageIndex,
          totalQuizScore
        );
        // console.log("scoreData", scoreData);
      }

      // 퀴즈 답변 로그 전송 중인지 확인
      if (quizQuestionLogManager.isQueueProcessing()) {
        await quizQuestionLogManager.waitForQueueToComplete();
      }

      // 퀴즈 스테이지 로그 생성
      const quizStageLogHandler = new QuizStageLogHandler();
      const newQuizStageLog = await quizStageLogHandler.create({
        userId: userId ?? _quizLog?.userId ?? "",
        campaignId: campaign.id,
        quizSetId: quizSet.id,
        quizStageIndex: currentQuizStageIndex,
        quizStageId: currentQuizStage?.id ?? "",
        authType: authType,
        score,
        totalScore: totalQuizScore,
        percentile: scoreData?.percentile || null,
        scoreRange: scoreData?.userBin?.range || null,
        elapsedSeconds: stageElapsedSeconds,
        remainingHearts,
        isBadgeStage: isBadgeStage(),
        isBadgeAcquired,
        badgeActivityId:
          authType === AuthType.SUMTOTAL
            ? getCurrentStageBadgeActivityId()
            : null,
        quizLog: _quizLog,
      });

      // 퀴즈 로그 업데이트
      const quizLogHandler = new QuizLogHandler();
      const updatedQuizLog = await quizLogHandler.update({
        quizStageIndex: currentQuizStageIndex,
        isBadgeAcquired,
        totalScore: totalQuizScore,
        elapsedSeconds: totalQuizTime,
        quizLogId: _quizLog?.id ?? "",
        quizStagesLength: quizSet.quizStages.length,
      });
      // console.info("scoreData", scoreData);

      console.log("newQuizStageLog", newQuizStageLog);
      // ################ DATA 업데이트 모두 완료 ################
      // 퀴즈 로그 State 업데이트
      setQuizStagesTotalScore(totalQuizScore);
      // setQuizStageLogs([..._quizStageLogs, newQuizStageLog]);
      setQuizStageLogs((prevLogs) => {
        const logMap = new Map();

        [...prevLogs, newQuizStageLog].forEach((log) => {
          // 같은 quizStageIndex가 있다면 updatedAt이 더 큰 값을 유지
          if (
            !logMap.has(log.quizStageIndex) ||
            logMap.get(log.quizStageIndex).updatedAt < log.updatedAt
          ) {
            logMap.set(log.quizStageIndex, log);
          }
        });

        return Array.from(logMap.values());
      });

      setQuizLog(updatedQuizLog);
      setLastCompletedQuizStage(
        updatedQuizLog.lastCompletedStage != null
          ? quizSet.quizStages[updatedQuizLog.lastCompletedStage]
          : null
      );

      if (!isLastStage()) {
        nextStage();
      }

      setIsLoading(false);

      return {
        score: scoreData ?? {
          data: [],
          sampleSize: null,
          userBin: null,
          userScore: totalQuizScore,
          percentile: 50,
        },
        isBadgeAcquired: isBadgeAcquired,
        badgeStage: isBadgeStage(),
        badgeImageURL: currentQuizStage?.badgeImage?.imagePath ?? "",
        nextStageIndex: updatedQuizLog.isCompleted
          ? null
          : currentQuizStageIndex + 1,
      };
    } catch (error) {
      console.error("finalizeCurrentStage에서 에러 발생:", error);
      throw error;
    }
  };

  const handleStageFailure = async (): Promise<void> => {
    setIsLoading(true);

    // 퀴즈 답변 로그 전송 중인지 확인
    if (quizQuestionLogManager.isQueueProcessing()) {
      await quizQuestionLogManager.waitForQueueToComplete();
    }

    quizQuestionLogManager.init(currentQuizStageIndex);

    setIsLoading(false);
  };

  const getQuizTotalElapsedSeconds = (): number => {
    return _quizStageLogs.reduce((total, log) => total + log.elapsedSeconds, 0);
  };

  const isLastQuestionOnState = (): boolean => {
    if (!currentQuizStage?.questions) {
      return false;
    }
    return currentQuizStage?.questions.length - 1 === currentQuestionIndex;
  };

  const nextStage = (): void => {
    const nextQuizStageIndex = currentQuizStageIndex + 1;
    console.log("nextStage", currentQuizStageIndex, nextQuizStageIndex);

    setCurrentQuizStageIndex(nextQuizStageIndex);
    setCurrentQuizStage(quizSet.quizStages[nextQuizStageIndex]);
    setCurrentStageQuestions(quizSet.quizStages[nextQuizStageIndex].questions);
    setCurrentQuestionIndex(0);
    quizQuestionLogManager.init(nextQuizStageIndex);
  };

  const clearUserAnswerLogs = (): void => {
    quizQuestionLogManager.clear();
  };

  const isBadgeStage = (): boolean => {
    return currentQuizStage?.isBadgeStage ?? false;
  };

  const isLastStage = (): boolean => {
    console.log(
      "isLastStage",
      quizSet.quizStages.length - 1,
      currentQuizStageIndex
    );
    return quizSet.quizStages.length - 1 === currentQuizStageIndex;
  };

  const getCurrentStageBadgeActivityId = (): string | null => {
    if (
      _quizLog?.quizSetPath?.toLocaleLowerCase() ===
      "NAT_2756_de-DE"?.toLocaleLowerCase()
    ) {
      if (currentQuizStageIndex === 2) {
        return "252552";
      }
      if (currentQuizStageIndex === 3) {
        return "252554";
      }
    }

    if (
      _quizLog?.quizSetPath?.toLocaleLowerCase() ===
        "NAT_2756_fr-FR"?.toLocaleLowerCase() ||
      _quizLog?.quizSetPath?.toLocaleLowerCase() ===
        "NAT_2756_fr-FR-ch"?.toLocaleLowerCase()
    ) {
      if (currentQuizStageIndex === 2) {
        return "252558";
      }
      if (currentQuizStageIndex === 3) {
        return "252560";
      }
    }

    if (
      _quizLog?.quizSetPath?.toLocaleLowerCase() ===
      "NAT_2756_it-IT"?.toLocaleLowerCase()
    ) {
      if (currentQuizStageIndex === 2) {
        return "252566";
      }
      if (currentQuizStageIndex === 3) {
        return "252567";
      }
    }

    if (
      _quizLog?.quizSetPath?.toLocaleLowerCase() ===
      "NAT_2788_ar-TN"?.toLocaleLowerCase()
    ) {
      if (currentQuizStageIndex === 2) {
        return "255424";
      }
      if (currentQuizStageIndex === 3) {
        return "255426";
      }
    }

    return currentQuizStage?.badgeActivityId ?? null;
  };

  const getCurrentStageBadgeImageUrl = (): string | null => {
    if (currentQuizStage?.badgeImage?.imagePath) {
      return `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${currentQuizStage.badgeImage?.imagePath}`;
    }
    return null;
  };

  const processBadgeAcquisition = async (
    elapsedSeconds: number
  ): Promise<boolean> => {
    // 썸토탈 뱃지 발급
    if (authType === AuthType.SUMTOTAL) {
      const activityId = getCurrentStageBadgeActivityId();

      await new Promise((resolve) => setTimeout(resolve, 3000));
      console.log("activityId", activityId, _quizLog?.quizSetPath);
      if (!activityId) {
        Sentry.captureMessage(
          `[processBadgeAcquisition] Activity ID is not found : ${quizLog?.quizSetPath}`
        );
        return false;
      }

      const result = await new QuizBadgeHandler().issueBadge(
        userId,
        activityId,
        elapsedSeconds
      );
      return result;
    }

    // 이메일 뱃지 발급
    const badgeImageUrl = getCurrentStageBadgeImageUrl();
    const translationMessage = {
      galaxy_ai_expert: translation("galaxy_ai_expert"),
      email_badge_date: translation("email_badge_date"),
      email_badge_description_1: translation("email_badge_description_1"),
      email_badge_description_2: translation("email_badge_description_2"),
      email_badge_description_3: translation("email_badge_description_3"),
      email_badge_description_4: translation("email_badge_description_4"),
    };

    if (!badgeImageUrl) {
      Sentry.captureMessage(
        `[processBadgeAcquisition] Badge Image URL is not found : ${quizLog?.quizSetPath}`
      );
      return false;
    }

    const result = await new QuizBadgeHandler().sendBadgeEmail(
      userId,
      badgeImageUrl,
      translationMessage,
      currentQuizStageIndex
    );

    return result;
  };

  const isComplete = (): boolean => {
    if (_quizLog) {
      return _quizLog.lastCompletedStage === quizSet.quizStages.length - 1;
    }
    return false;
    // return _quizLog?.isCompleted ?? false;
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
      // assert(false, "Question not found");
      Sentry.captureMessage(`Question not found: questionId: ${questionId}`);
      return;
    }

    const correctOptionIds = question.options
      .filter((option: QuestionOption) => option.isCorrect)
      .map((option: QuestionOption) => option.id);

    // console.log("logUserAnswer", authType);

    quizQuestionLogManager.add({
      authType: authType,
      isCorrect,
      campaignId: campaign.id,
      userId: userId ?? _quizLog?.userId ?? "",
      quizSetId: quizSet.id,
      questionId: questionId,
      selectedOptionIds: selectedOptionIds,
      correctOptionIds: correctOptionIds,
      quizStageIndex: currentQuizStageIndex,
      category: question.category,
      specificFeature: question.specificFeature,
      product: question.product,
      questionType: question.questionType,
      elapsedSeconds: elapsedSeconds,
      quizStageId: currentQuizStage?.id ?? "",
      createdAt: new Date().toISOString(),
      domainId: _quizLog?.domainId,
      languageId: _quizLog?.languageId,
      jobId: _quizLog?.jobId || "",
      regionId: _quizLog?.regionId,
      subsidiaryId: _quizLog?.subsidiaryId,
      storeId: _quizLog?.storeId,
      channelId: _quizLog?.channelId,
      channelName: _quizLog?.channelName,
      channelSegmentId: _quizLog?.channelSegmentId,
      originalQuestionId: question.originalQuestionId,
      originalIndex: question.originalIndex,
    });
  };

  const getAllStageMaxScore = () => {
    const maxScore = quizSet.quizStages.reduce(
      (total, stage: QuizStageEx) =>
        new QuizScoreHandler().calculateMaxScore(
          stage.questions.length,
          stage.lifeCount
        ) + total,
      0
    );

    // console.log("getAllStageMaxScore", maxScore);
    return maxScore;
  };

  return (
    <QuizContext.Provider
      value={{
        userId,
        isLoading,
        quizSet,
        quizStageLogs: _quizStageLogs,
        quizLog: _quizLog,
        quizStagesTotalScore,
        currentQuizStageIndex,
        currentQuestionIndex,
        currentQuizStage,
        lastCompletedQuizStage,
        currentStageQuestions,
        isComplete,
        finalizeCurrentStage,
        handleStageFailure,
        logUserAnswer,
        isLastQuestionOnState,
        isBadgeStage,
        getAllStageMaxScore,
        clearUserAnswerLogs,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = (): QuizContextType => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error("useQuiz는 QuizProvider 내에서만 사용할 수 있습니다.");
  }
  return context;
};
