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
};

class QuizQuestionLogManager {
  private logs: QuizLog[] = [];
  private stageIndex: number | null = null;
  private logQueue = new AsyncQueue<QuizLog>();
  private isProcessingQueue = false;

  constructor(initialStageIndex: number | null = null) {
    this.stageIndex = initialStageIndex;
    // console.log(
      initialStageIndex !== null
        ? `[QuizLogManager] initialized with stageIndex: ${initialStageIndex}`
        : "[QuizLogManager] initialized without a stageIndex."
    );
  }

  init(stageIndex: number): void {
    this.stageIndex = stageIndex;
    this.logs = [];
    // console.log(`[QuizLogManager] Stage ${stageIndex} started. Logs reset.`);
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

    while (!this.logQueue.isEmpty()) {
      const log = await this.logQueue.dequeue();
      try {
        await this.attemptToSendLog(log);
      } catch (error) {
        console.error(
          "[QuizLogManager] Failed to process log after retries:",
          log,
          error
        );
        Sentry.captureException(error);
      }
    }

    this.isProcessingQueue = false;
  }

  private async attemptToSendLog(log: QuizLog): Promise<void> {
    let attempts = 0;
    const maxAttempts = 2;

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
          // console.log("[QuizLogManager] Log successfully sent:", log);
          return;
        }

        console.warn("[QuizLogManager] Failed to send log, retrying:", log);
      } catch (error) {
        console.error("[QuizLogManager] Error during log send attempt:", error);
      }
    }

    throw new Error("Max attempts reached for log:");
  }

  isQueueProcessing(): boolean {
    // console.log("[QuizLogManager] isQueueProcessing", this.isProcessingQueue);
    return this.isProcessingQueue;
  }

  async waitForQueueToComplete(): Promise<void> {
    // console.log("[QuizLogManager] waitForQueueToComplete waiting");
    while (this.isProcessingQueue) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    // console.log("[QuizLogManager] waitForQueueToComplete done");
  }

  getLogs(): QuizLog[] {
    return this.logs;
  }

  getTotalElapsedSeconds(): number {
    return this.logs.reduce((total, log) => total + log.elapsedSeconds, 0);
  }
}

export default QuizQuestionLogManager;
