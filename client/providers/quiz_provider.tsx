"use client";

import QuizScoreCalculator from "@/app/lib/score/quizScoreCalculator";
import { usePathNavigator } from "@/route/usePathNavigator";
import { areArraysEqualUnordered } from "@/utils/validationUtils";
import {
  AuthType,
  Campaign,
  Domain,
  Language,
  Question,
  QuestionOption,
  QuestionType,
  QuizSet,
  QuizStage,
  UserQuizLog,
  UserQuizQuestionLog,
  UserQuizStageLog,
} from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import assert from "assert";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useCampaign } from "./campaignProvider";
import QuizLogManager, { QuizLog } from "./managers/quizLogManager";

export interface QuizSetEx extends QuizSet {
  language: Language;
  campaign: Campaign;
  domain: Domain;
  quizStages: QuizStageEx[];
}

export interface QuizStageEx extends QuizStage {
  questions: QuestionEx[];
}

export interface QuestionEx extends Question {
  options: QuestionOption[];
}

interface QuizContextType {
  quizSet: QuizSetEx;
  quizStageLogs: UserQuizStageLog[];
  quizQuestionLogs: UserQuizQuestionLog[];
  language: Language | null;
  quizLog: UserQuizLog | null;
  currentQuizStageIndex: number;
  currentQuestionIndex: number;
  currentQuizStage: QuizStageEx;
  lastCompletedQuizStage: QuizStageEx | null;
  currentStageQuestions: QuestionEx[];
  isBadgeStage(): boolean;
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

// 각 데이터 항목에 대한 타입 정의
export interface DataItem {
  range: string; // 범위 ("0-9", "10-19" 등)
  count: number; // 해당 범위에 속하는 사용자 수
  userIncluded: boolean; // 사용자가 이 범위에 포함되어 있는지 여부
}

// userBin 타입 정의
export interface UserBin {
  range: string; // 사용자가 속한 범위 ("0-9" 등)
  count: number; // 해당 범위에 속하는 사용자 수
}

// 전체 데이터 구조 타입 정의
export interface ScoreData {
  data: DataItem[]; // 점수 범위에 따른 데이터 배열
  sampleSize: number | null; // 전체 샘플 크기
  userBin: UserBin | null; // 사용자가 속한 범위 정보
  userScore: number; // 사용자의 점수
  percentile: number | null; // 상위 %
}

export interface EndStageResult {
  score: ScoreData;
  isBadgeAcquired: boolean;
  badgeStage: boolean;
  badgeImageURL: string;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider = ({
  userId,
  authType,
  children,
  quizSet,
  language,
  quizLog,
  quizStageLogs,
  quizQuestionLogs,
  quizSetPath,
}: {
  userId: string | undefined;
  authType: AuthType | undefined;
  children: React.ReactNode;
  quizSet: QuizSetEx;
  language: Language;
  quizLog: UserQuizLog | null;
  quizStageLogs: UserQuizStageLog[] | null;
  quizQuestionLogs: UserQuizQuestionLog[] | null;
  quizSetPath: string;
}) => {
  const { routeToPage } = usePathNavigator();
  const pathname = usePathname();

  const { campaign } = useCampaign();
  const [currentQuizSetPath, setCurrentQuizSetPath] =
    useState<string>(quizSetPath);
  const [_quizLog, setQuizLog] = useState<UserQuizLog | null>(quizLog);
  const [_quizStageLogs, setQuizStageLogs] = useState<UserQuizStageLog[]>(
    quizStageLogs ?? []
  );
  const [_quizQuestionLogs, setQuizQuestionLogs] = useState<
    UserQuizQuestionLog[]
  >(quizQuestionLogs ?? []);
  const [quizStagesTotalScore, setQuizStagesTotalScore] = useState<number>(
    (quizStageLogs ?? []).reduce(
      (total, stageLog: UserQuizStageLog) => total + (stageLog.score ?? 0),
      0
    )
  );
  console.log(
    "QuizProvider quizStagesTotalScore",
    (quizLog?.lastCompletedStage ?? 0) + 1,
    quizSet.quizStages.length - 1
  );
  const [currentQuizStageIndex, setCurrentQuizStageIndex] = useState(
    quizLog?.lastCompletedStage == null
      ? 0
      : Math.min(quizLog?.lastCompletedStage + 1, quizSet.quizStages.length - 1)
  );
  // const [currentQuizStageIndex, setCurrentQuizStageIndex] = useState(quizLog?.lastCompletedStage != null ? quizLog?.lastCompletedStage + 1 : 0);

  // console.log(
  //   "QuizProvider quizQuestionLogs",
  //   quizQuestionLogs,
  //   currentQuizStageIndex
  // );

  if (
    currentQuizStageIndex >= quizSet.quizStages.length &&
    pathname.includes("/quiz")
  ) {
    routeToPage("map");
  }

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuizStage, setCurrentQuizStage] = useState<QuizStageEx>(
    quizSet.quizStages[currentQuizStageIndex]
  );
  const [lastCompletedQuizStage] = useState<QuizStageEx | null>(
    quizLog?.lastCompletedStage != null
      ? quizSet.quizStages[quizLog?.lastCompletedStage]
      : null
  );
  const [currentStageQuestions, setCurrentStageQuestions] = useState<
    QuestionEx[]
  >(quizSet.quizStages[currentQuizStageIndex]?.questions ?? []);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const quizScoreCalculator = new QuizScoreCalculator();

  // const quizScoreCalculatorRef = useRef<QuizScoreCalculator | null>(null);

  // if (quizScoreCalculatorRef.current === null) {
  //   quizScoreCalculatorRef.current = new QuizScoreCalculator(); // 인스턴스 생성
  // }

  // const quizScoreCalculator = quizScoreCalculatorRef.current;

  const quizLogManagerRef = useRef(new QuizLogManager(currentQuizStageIndex)); // 유지되는 인스턴스
  const quizLogManager = quizLogManagerRef.current;

  const { data: session } = useSession();

  const isCreatingQuizLogRef = useRef(false); // 실행 상태를 추적

  const isLastStage = (): boolean => {
    return quizSet.quizStages.length - 1 === currentQuizStageIndex;
  };

  // console.log("QuizProvider quizLog", quizLog, userId);

  useEffect(() => {
    console.log("QuizProvider useEffect", userId, _quizLog?.id);
    if (!_quizLog) {
      createQuizLog();
    }
  }, [userId, _quizLog?.id]);

  const createQuizLog = async () => {
    if (isCreatingQuizLogRef.current) {
      console.log("createQuizLog is already running");
      return; // 이미 실행 중인 경우 종료
    }

    isCreatingQuizLogRef.current = true; // 실행 상태 설정
    try {
      console.log("createQuizLog started", userId);
      const initHistoryResponse = await fetch(
        // `${process.env.NEXT_PUBLIC_BASE_PATH}/api/logs/quizzes/sets/?quizset_path=${currentQuizSetPath}`,
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/logs/quizzes/sets`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, quizsetPath: currentQuizSetPath }),
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
      // const newQuizStageLogs = initHistoryData.item.quizStageLogs;
      // const newQuizQuestionLogs = initHistoryData.item.quizQuestionLogs;

      setQuizLog(newQuizLog);
      // setQuizStageLogs(newQuizStageLogs ?? []);
      // setQuizQuestionLogs(newQuizQuestionLogs ?? []);
    } catch (error) {
      console.error("Failed to initialize quiz history:", error);
      Sentry.captureException(error);
    } finally {
      isCreatingQuizLogRef.current = false; // 실행 상태 해제
    }
  };

  const endStage = async (remainingHearts: number): Promise<EndStageResult> => {
    // 현재 스테이지의 점수 계산
    const score = quizScoreCalculator.calculateStageScore(
      quizLogManager.getLogs(),
      remainingHearts
    );
    const totalQuizScore = quizStagesTotalScore + score;
    const isLastStage = currentQuizStageIndex === quizSet.quizStages.length - 1;

    // 현재 스테이지의 총 소요시간 계산
    const stageElapsedSeconds = quizLogManager.getTotalElapsedSeconds();
    const totalQuizTime = getQuizTotalElapsedSeconds() + stageElapsedSeconds;

    setIsLoading(true);

    // 뱃지 스테이지 여부 확인
    let badgeStage = isBadgeStage();
    let isBadgeAcquired = false;
    if (badgeStage) {
      isBadgeAcquired = await processBadgeAcquisition(stageElapsedSeconds);
    }

    // 랭킹 및 그래프 데이터 가져오기
    let scoreData: ScoreData | null = null;
    if (badgeStage || isLastStage) {
      scoreData = await getRankAndGraphData(
        currentQuizStageIndex,
        totalQuizScore
      );
      console.log("scoreData", scoreData);
    }

    // 퀴즈 스테이지 로그 생성
    await createQuizQuestionLogs(quizLogManager.getLogs());

    // 퀴즈 스테이지 로그 생성
    const newQuizStageLog: UserQuizStageLog = await createQuizStageLog(
      score,
      totalQuizScore,
      scoreData?.percentile || null,
      scoreData?.userBin?.range || null,
      stageElapsedSeconds,
      remainingHearts,
      badgeStage,
      isBadgeAcquired,
      authType === AuthType.SUMTOTAL ? getCurrentStageBadgeActivityId() : null
    );

    // 퀴즈 로그 업데이트
    const updatedQuizLog: UserQuizLog = await updateQuizSummaryLog(
      currentQuizStageIndex,
      badgeStage,
      isLastStage ? totalQuizScore : null,
      isLastStage ? totalQuizTime : null
    );

    console.info("scoreData", scoreData);

    // 퀴즈 로그 State 업데이트
    setQuizStagesTotalScore(totalQuizScore);
    setQuizStageLogs([..._quizStageLogs, newQuizStageLog]);
    setQuizLog(updatedQuizLog);

    // 다음 스테이지로 이동
    quizLogManager.endStage();

    setIsLoading(false);

    return {
      score:
        scoreData ??
        ({
          userScore: totalQuizScore,
        } as ScoreData),
      isBadgeAcquired: isBadgeAcquired,
      badgeStage: badgeStage,
      badgeImageURL: currentQuizStage?.badgeImageUrl ?? "",
    };
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
    return currentQuizStage?.isBadgeStage ?? false;
  };

  const getCurrentStageBadgeActivityId = (): string | null => {
    return currentQuizStage?.badgeActivityId ?? null;
  };

  const getCurrentStageBadgeImageUrl = (): string | null => {
    if (currentQuizStage?.badgeImageUrl) {
      return `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${currentQuizStage.badgeImageUrl}`;
    }
    return null;
  };

  const getRankAndGraphData = async (
    quizStageIndex: number,
    score: number
  ): Promise<ScoreData | null> => {
    console.log("get score");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/campaigns/score?userId=${userId}&quizStageIndex=${quizStageIndex}&campaignId=${campaign.id}&userScore=${score}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );
      const data = await response.json();
      console.log("get score", data);

      return data as ScoreData;
    } catch (error) {
      console.error("Failed to get score:", error);
      Sentry.captureException(error);
      return null;
    }
  };

  const processBadgeAcquisition = async (
    elapsedSeconds: number
  ): Promise<boolean> => {
    try {
      console.log("processBadgeAcquisition", authType);
      if (authType === AuthType.SUMTOTAL) {
        const activityId = getCurrentStageBadgeActivityId();
        if (!activityId) {
          return false;
        }
        const registered = await postActivitieRegister(activityId);
        const result = await postActivityEnd(activityId, elapsedSeconds);
        return result;
      } else {
        const badgeImageUrl = getCurrentStageBadgeImageUrl();
        console.log("badgeImageUrl", badgeImageUrl);
        if (badgeImageUrl) {
          const result = await sendBadgeEmail(badgeImageUrl!);
          return result;
        }
      }

      return false;
    } catch (error) {
      Sentry.captureException(error);
      return false;
    }
  };

  const sendBadgeEmail = async (badgeImageUrl: string) => {
    try {
      const userId: string | undefined = session?.user.id;
      const subject: string = "You have earned the Galaxy AI Expert Badge.";
      const bodyHtml: string = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              background-color: #000000;
              color: #333333;
            }
            .email-container {
              max-width: 840px;
              width: 100%;
              height: 414px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 40px;
              border-radius: 10px;
              text-align: center;
              background-image: url("https://assets-stage.samsungplus.net/certification/common/images/bg_pattern_01.png"); /* 배경 패턴 URL */
              background-repeat: repeat;
              background-size: 50%;
              background-position: center;
            }
            .header {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 20px;
            }
            .badge-image {
              margin: 20px auto;
              width: 120px;
              height: 120px;
            }
            .badge-title {
              font-size: 16px;
              font-weight: bold;
              margin: 10px 0;
            }
            .date {
              font-size: 14px;
              margin: 5px 0 20px 0;
              color: #555555;
            }
            .congratulations {
              font-size: 14px;
              font-weight: bold;
              margin-top: 20px;
            }
            .footer {
              font-size: 12px;
              color: #aaaaaa;
              margin-top: 30px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">S+ Galaxy AI Expert(Paradigm)</div>
            <img
              src="${badgeImageUrl}"
              alt="Galaxy AI Expert Badge"
              class="badge-image"
            />
            <div class="congratulations">
              Congratulations!<br />
              You have earned the Galaxy AI Expert Badge.
            </div>
          </div>
          <div class="footer">
            This message was automatically delivered by Samsung+ service. Do not reply
            to this message.<br />
            Copyright © 2024 SAMSUNG all rights reserved.
          </div>
        </body>
      </html>
`;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/activity/send-badge-email`,
        {
          method: "POST",
          cache: "no-store",
          body: JSON.stringify({
            userId,
            subject,
            bodyHtml,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        // TODO: 이메일 전송 오류 저장해 놓기
        throw new Error(errorData.message || "Failed to fetch activities");
      }

      const data = await response.json();
      console.log("sendBadgeEmail data", data);

      return true;
    } catch (err: any) {
      console.error(err.message || "An unexpected error occurred");
      Sentry.captureException(err);
      return false;
      // TODO: 이메일 전송 오류 저장해 놓기
      // throw new Error(err.message || "An unexpected error occurred");
    }
  };

  const postActivitieRegister = async (
    activityId: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/sumtotal/activity/register`,
        {
          method: "POST",
          cache: "no-store",
          body: JSON.stringify({
            activityId: activityId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        // TODO: 활동 등록 오류 저장해 놓기
        throw new Error(errorData.message || "Failed to fetch activities");
      }

      const data = await response.json();

      return true;
    } catch (err: any) {
      console.error(err.message || "An unexpected error occurred");
      Sentry.captureException(err);
      return false;
      // TODO: 활동 등록 오류 저장해 놓기
      // throw new Error(err.message || "An unexpected error occurred");
    }
  };

  const postActivityEnd = async (
    activityId: string,
    elapsedSeconds: number
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/sumtotal/activity/end`,
        {
          method: "POST",
          cache: "no-store",
          body: JSON.stringify({
            activityId: activityId,
            status: "Attended",
            // elapsedSeconds: elapsedSeconds,
            elapsedSeconds: 120,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        // TODO: 활동 등록 오류 저장해 놓기
        throw new Error(errorData.message || "Failed to fetch activities");
      }

      const data = await response.json();
      console.log("data", data);

      return true;
    } catch (err: any) {
      console.error(err.message || "An unexpected error occurred");
      Sentry.captureException(err);
      return false;
      // TODO: 활동 등록 오류 저장해 놓기
      // throw new Error(err.message || "An unexpected error occurred");
    }
  };

  const isComplete = (): boolean => {
    return _quizLog?.isCompleted ?? false;
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

      console.log("confirmAnswer", authType);

      quizLogManager.addLog({
        authType: authType,
        isCorrect: result.isCorrect,
        campaignId: campaign.id,
        userId: userId ?? _quizLog?.userId ?? "",
        // jobId: _quizLog.jobId || "",
        quizSetId: quizSet.id,
        questionId: questionId,
        // languageId: language?.id,
        selectedOptionIds: selectedOptionIds,
        correctOptionIds: result.correctOptionIds,
        // domainId: quizLog.domainId,
        // subsidaryId: quizLog.subsidaryId,
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
        subsidaryId: _quizLog?.subsidaryId,
        storeId: _quizLog?.storeId,
        channelId: _quizLog?.channelId,
        channelName: _quizLog?.channelName,
        channelSegmentId: _quizLog?.channelSegmentId,
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

    console.log("logUserAnswer", authType);

    quizLogManager.addLog({
      authType: authType,
      isCorrect,
      campaignId: campaign.id,
      userId: userId ?? _quizLog?.userId ?? "",

      quizSetId: quizSet.id,
      questionId: questionId,
      // languageId: language?.id,
      selectedOptionIds: selectedOptionIds,
      correctOptionIds: correctOptionIds,
      // domainId: quizLog.domainId,
      // subsidaryId: quizLog.subsidaryId,
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
      subsidaryId: _quizLog?.subsidaryId,
      storeId: _quizLog?.storeId,
      channelId: _quizLog?.channelId,
      channelName: _quizLog?.channelName,
      channelSegmentId: _quizLog?.channelSegmentId,
    });
  };

  const getCorrectOptionIds = (questionId: string): string[] => {
    const question = currentQuizStage?.questions.find(
      (q: Question) => q.id === questionId
    );

    if (!question) {
      // throw new Error("Question not found");
      assert(false, "Question not found");
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
      // throw new Error(
      //   "An unexpected error occurred while registering quiz log"
      // );
    }
  };

  const createQuizStageLog = async (
    score: number,
    totalScore: number,
    percentile: number | null,
    scoreRange: string | null,
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
            userId: userId ?? _quizLog?.userId ?? "",
            authType: authType,
            // jobId: _quizLog?.jobId || "",
            quizSetId: quizSet.id,
            quizStageIndex: currentQuizStageIndex,
            quizStageId: currentQuizStage?.id ?? "",
            isCompleted: true,
            isBadgeStage,
            isBadgeAcquired,
            badgeActivityId,
            remainingHearts,
            score,
            percentile,
            scoreRange,
            totalScore,
            elapsedSeconds,
            campaignId: campaign.id,
            // domainId: quizLog.domainId,
            // languageId: language?.id,
            domainId: _quizLog?.domainId,
            languageId: _quizLog?.languageId,
            jobId: _quizLog?.jobId || "",
            regionId: _quizLog?.regionId,
            subsidaryId: _quizLog?.subsidaryId,
            storeId: _quizLog?.storeId,
            channelId: _quizLog?.channelId,
            channelName: _quizLog?.channelName,
            channelSegmentId: _quizLog?.channelSegmentId,
          }),
        }
      );

      //     percentile  Int?
      // scoreRange  String?
      // // languageCode String

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create quiz stage log");
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

  const updateQuizSummaryLog = async (
    quizStageIndex: number,
    isBadgeAcquired: boolean,
    totalScore: number | null,
    elapsedSeconds: number | null
  ): Promise<UserQuizLog> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/logs/quizzes/sets/${_quizLog?.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lastCompletedStage: quizStageIndex,
            isCompleted: quizStageIndex === quizSet.quizStages.length - 1,
            isBadgeAcquired,
            score: totalScore,
            elapsedSeconds: elapsedSeconds,
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
      console.error("Error updateQuizSummaryLog:", error);
      Sentry.captureException(error);
      throw new Error(
        "An unexpected error occurred while registering quiz log"
      );
    }
  };

  const getAllStageMaxScore = () => {
    const maxScore = quizSet.quizStages.reduce(
      (total, stage: QuizStageEx) =>
        quizScoreCalculator.calculateMaxScore(
          stage.questions.length,
          stage.lifeCount
        ) + total,
      0
    );

    console.log("getAllStageMaxScore", maxScore);
    return maxScore;
  };

  return (
    <QuizContext.Provider
      value={{
        quizSet,
        quizStageLogs: _quizStageLogs,
        quizQuestionLogs: _quizQuestionLogs,
        language,
        quizLog: _quizLog,
        currentQuizStageIndex,
        currentQuestionIndex,
        currentQuizStage,
        lastCompletedQuizStage,
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
        // processBadgeAcquisition,
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

export const useQuiz = (): QuizContextType => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error("useQuiz는 QuizProvider 내에서만 사용할 수 있습니다.");
  }
  return context;
};
