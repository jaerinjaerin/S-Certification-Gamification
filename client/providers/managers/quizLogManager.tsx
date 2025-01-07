"use client";

import { AuthType, QuestionType } from "@prisma/client";
import assert from "assert";

export type QuizLog = {
  authType: AuthType | undefined;
  isCorrect: boolean;
  campaignId: string;
  userId: string;
  quizSetId: string;
  questionId: string;
  quizStageId: string;
  quizStageIndex: number;
  selectedOptionIds: string[];
  correctOptionIds: string[];
  category: string | null | undefined;
  specificFeature: string | null | undefined;
  product: string | null | undefined;
  questionType: QuestionType;
  elapsedSeconds: number;
  createdAt: string;
  domainId: string | null | undefined;
  regionId: string | null | undefined;
  subsidiaryId: string | null | undefined;
  channelId: string | null | undefined;
  channelName: string | null | undefined;
  channelSegmentId: string | null | undefined;
  storeId: string | null | undefined;
  jobId: string;
  languageId: string | null | undefined;
};

class QuizLogManager {
  private logs: QuizLog[] = [];
  private stageIndex: number | null = null;

  /**
   * QuizLogManager 생성자
   * @param initialStageIndex 초기 스테이지 인덱스 (null일 경우 초기화 필요)
   */
  constructor(initialStageIndex: number | null = null) {
    this.stageIndex = initialStageIndex;
    console.log(
      initialStageIndex !== null
        ? `QuizLogManager initialized with stageIndex: ${initialStageIndex}`
        : "QuizLogManager initialized without a stageIndex."
    );
  }

  /**
   * 시작 시 스테이지 초기화
   * @param stageIndex 스테이지 인덱스
   */
  startStage(stageIndex: number): void {
    this.stageIndex = stageIndex;
    this.logs = []; // 기존 로그 초기화
    console.log(`Stage ${stageIndex} started. Logs reset.`);
  }

  endStage(): void {
    this.stageIndex = null;
    this.logs = [];
    console.log("Stage ended. Logs cleared.");
  }

  /**
   * 퀴즈 로그 추가
   * @param log 퀴즈 로그 객체
   */
  addLog(log: QuizLog): void {
    console.info("QuizLogManager log", this.stageIndex, log.quizStageIndex);
    if (this.stageIndex === null) {
      // throw new Error("Stage has not started. Call startStage() first.");
      assert(
        this.stageIndex !== null,
        "Stage has not started. Call startStage() first."
      );
    }

    if (log.quizStageIndex !== this.stageIndex) {
      assert(
        log.quizStageIndex === this.stageIndex,
        `Log stageIndex (${log.quizStageIndex}) does not match current stageIndex (${this.stageIndex}).`
      );
      // throw new Error(
      //   `Log stageIndex (${log.stageIndex}) does not match current stageIndex (${this.stageIndex}).`
      // );
    }

    if (this.logs.find((l) => l.questionId === log.questionId)) {
      return;
    }

    this.logs.push(log);
    console.info(`Log added for questionId: ${log.questionId}`);
  }

  getLogs(): QuizLog[] {
    return this.logs;
  }

  getTotalElapsedSeconds(): number {
    return this.logs.reduce((total, log) => total + log.elapsedSeconds, 0);
  }

  /**
   * 스테이지 완료 시 모든 로그 전송
   */
  // async completeStage(): Promise<void> {
  //   if (this.stageIndex === null) {
  //     throw new Error("No stage is currently active.");
  //   }

  //   if (this.logs.length === 0) {
  //     console.log("No logs to send.");
  //     return;
  //   }

  //   try {
  //     console.log(
  //       `Sending ${this.logs.length} logs for stage ${this.stageIndex}...`
  //     );
  //     await Promise.all(this.logs.map((log) => sendQuizQuestionLog(log)));
  //     console.log("Logs successfully sent.");

  //     // 스테이지 종료 후 초기화
  //     this.stageIndex = null;
  //     this.logs = [];
  //   } catch (error) {
  //     console.error("Error sending logs:", error);
  //     throw new Error("Failed to send quiz logs.");
  //   }
  // }
}

export default QuizLogManager;
