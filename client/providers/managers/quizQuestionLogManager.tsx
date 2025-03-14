"use client";

import { AsyncQueue } from "@/utils/asyncQueue";
import { AuthType, QuestionType } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
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
  originalQuestionId: string | undefined;
  originalIndex: number | undefined;
};

class QuizQuestionLogManager {
  private logs: QuizLog[] = [];
  private stageIndex: number | null = null;
  private logQueue = new AsyncQueue<QuizLog>();
  private isProcessingQueue = false;

  constructor(initialStageIndex: number | null = null) {
    this.stageIndex = initialStageIndex;
    // console.log(
    //   initialStageIndex !== null
    //     ? `[QuizLogManager] initialized with stageIndex: ${initialStageIndex}`
    //     : "[QuizLogManager] initialized without a stageIndex."
    // );
  }

  init(stageIndex: number): void {
    this.stageIndex = stageIndex;
    this.logs = [];
    // console.log(`[QuizLogManager] Stage ${stageIndex} started. Logs reset.`);
  }

  clear() {
    this.logs = [];
  }

  reset(): void {
    this.stageIndex = null;
    this.logs = [];
    // console.log("[QuizLogManager] Stage ended. Logs cleared.");
  }

  add(log: QuizLog): void {
    // console.log("[QuizLogManager] log", this.stageIndex, log.quizStageIndex);
    if (this.stageIndex === null) {
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
      return;
    }

    if (this.logs.find((l) => l.questionId === log.questionId)) {
      console.log("이미 로그가 있습니다.");
      return;
    }

    this.logs.push(log);
    this.logQueue.enqueue(log);
    // console.log(`[QuizLogManager] Log added for questionId: ${log.questionId}`);

    if (!this.isProcessingQueue) {
      this.processLogQueue();
    }
  }

  private async processLogQueue(): Promise<void> {
    if (this.isProcessingQueue) return;

    this.isProcessingQueue = true;

    try {
      while (!this.logQueue.isEmpty()) {
        const log = await this.logQueue.dequeue();
        await this.attemptToSendLog(log);
      }
    } catch (error) {
      console.error("[QuizLogManager] Error in processLogQueue:", error);
    } finally {
      this.isProcessingQueue = false; // 반드시 false로 설정
    }
  }

  private async attemptToSendLog(log: QuizLog): Promise<void> {
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;

      try {
        const result = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_PATH}/api/logs/quizzes/questions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(log),
          }
        );

        if (result.ok) {
          console.log("[QuizLogManager] Log successfully sent:", log);
          return;
        }

        console.warn("[QuizLogManager] Failed to send log, retrying:", log);
      } catch (error) {
        console.error("[QuizLogManager] Error during log send attempt:", error);
      }
    }

    Sentry.captureException(
      new Error("Max attempts reached for log:"),
      (scope) => {
        scope.setContext("operation", {
          type: "api",
          endpoint: "/api/logs/quizzes/questions",
          method: "POST",
          description: "Failed to send badge email",
        });
        scope.setTag("userId", log.userId);
        scope.setTag("questionId", log.questionId);
        scope.setTag("correctOptionIds", log.correctOptionIds.toString());
        scope.setTag("selectedOptionIds", log.selectedOptionIds.toString());
        scope.setTag("isCorrect", log.isCorrect.toString());
        scope.setTag("campaignId", log.campaignId);
        scope.setTag("quizSetId", log.quizSetId);
        scope.setTag("quizStageId", log.quizStageId);
        scope.setTag("category", log.category);
        scope.setTag("specificFeature", log.specificFeature);
        scope.setTag("product", log.product);
        scope.setTag("questionType", log.questionType);
        scope.setTag("elapsedSeconds", log.elapsedSeconds.toString());
        scope.setTag("createdAt", log.createdAt);
        scope.setTag("domainId", log.domainId);
        scope.setTag("domainId", log.domainId);
        scope.setTag("regionId", log.regionId);
        scope.setTag("subsidiaryId", log.subsidiaryId);
        scope.setTag("channelId", log.channelId);
        scope.setTag("channelName", log.channelName);
        scope.setTag("channelSegmentId", log.channelSegmentId);
        scope.setTag("storeId", log.storeId);
        scope.setTag("jobId", log.jobId);
        scope.setTag("languageId", log.languageId);

        return scope;
      }
    );
  }

  isQueueProcessing(): boolean {
    // console.log("[QuizLogManager] isQueueProcessing", this.isProcessingQueue);
    return this.isProcessingQueue;
  }

  async waitForQueueToComplete(timeout: number = 20000): Promise<void> {
    const start = Date.now();

    while (this.isProcessingQueue) {
      if (Date.now() - start > timeout) {
        console.error("[QuizLogManager] waitForQueueToComplete timed out");
        // throw new Error("Queue processing timeout exceeded.");
        Sentry.captureException(
          new Error("Queue processing timeout exceeded."),
          (scope) => {
            scope.setContext("operation", {
              type: "api",
              endpoint: "/api/logs/quizzes/questions",
              method: "POST",
              description: "Queue processing timeout exceeded",
            });
            return scope;
          }
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  getLogs(): QuizLog[] {
    return this.logs;
  }

  getTotalElapsedSeconds(): number {
    return this.logs.reduce((total, log) => total + log.elapsedSeconds, 0);
  }
}

export default QuizQuestionLogManager;
