import { ScoreData } from "@/types/type";
import * as Sentry from "@sentry/nextjs";
import { QuizLog } from "./quizQuestionLogManager";

export class QuizScoreHandler {
  fetchRankAndGraphData = async (
    userId: string,
    campaignId: string,
    quizStageIndex: number,
    score: number
  ): Promise<ScoreData | null> => {
    console.log("get score");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/campaigns/score?userId=${userId}&quizStageIndex=${quizStageIndex}&campaignId=${campaignId}&userScore=${score}`,
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

  private baseScore = 20; // 기본 점수
  private comboBonus = 2; // 연속 정답 보너스
  private timeBonusThreshold = 60; // 문제 풀이 시간 보너스 기준 (초)
  // private timeBonus = 5; // 문제 풀이 시간 보너스 점수
  private levelTimeThresholds = [180, 210, 240, 270, 300, 330, 360, 420]; // 레벨 소요 시간 기준 (초)
  private levelTimeScores = [40, 35, 30, 25, 20, 15, 10, 5]; // 레벨 소요 시간 점수
  private heartBonus = 10; // 하트 보너스 점수

  /**
   * 문제별 점수를 계산합니다.
   */
  calculateQuizScore(log: QuizLog): number {
    let score = 0;

    // 정답 체크
    if (log.isCorrect) {
      score += this.baseScore; // 기본 점수 추가
    } else {
      // 오답이지만 멀티 선택 문제일 경우 정답 개수에 따른 점수 부여
      // 정답 개수에 따른 점수 분배
      const correctCount = log.correctOptionIds.length;
      const correctSelections = log.selectedOptionIds.filter((id) =>
        log.correctOptionIds.includes(id)
      ).length;

      // 정답 점수 분배 (기본 점수 / 정답 개수) * 맞춘 개수
      if (correctCount > 0) {
        score += Math.round(
          (this.baseScore / correctCount) * correctSelections
        );
      }
    }

    return score;
  }

  /**
   * 레벨별 점수를 계산합니다.
   */
  calculateStageScore(quizLogs: QuizLog[], remainingHearts: number): number {
    let totalScore = 0;
    let comboCount = 0;

    // 레벨 총 소요 시간 계산
    const levelTimeSeconds = quizLogs.reduce(
      (total, log) => total + log.elapsedSeconds,
      0
    );

    for (const log of quizLogs) {
      const quizScore = this.calculateQuizScore(log);

      // 연속 정답 보너스
      if (log.isCorrect) {
        comboCount++;
        totalScore += comboCount > 1 ? this.comboBonus : 0;
      } else {
        comboCount = 0; // 연속 정답 끊김
      }

      totalScore += quizScore;
    }

    // 레벨 소요 시간 보너스
    const levelTimeScore = this.calculateLevelTimeBonus(levelTimeSeconds);
    totalScore += levelTimeScore;

    // 하트 잔여 보너스
    totalScore += remainingHearts * this.heartBonus;

    return totalScore;
  }

  /**
   * 문제 개수와 하트 개수를 입력받아 만점을 계산합니다.
   */
  calculateMaxScore(totalQuestions: number, totalHearts: number): number {
    let maxScore = 0;
    let comboCount = 0;

    // 각 문제를 정답으로 가정하여 점수 계산
    for (let i = 0; i < totalQuestions; i++) {
      // maxScore += this.baseScore +  this.timeBonus; // 기본 점수 + 시간 보너스
      maxScore += this.baseScore; // 기본 점수

      // 연속 정답 보너스
      comboCount++;
      maxScore += comboCount > 1 ? this.comboBonus : 0;
    }

    // 레벨 소요 시간 보너스 (최소 시간으로 가정)
    // const minLevelTime = totalQuestions * 5;
    const minLevelTime = this.levelTimeThresholds[0] - 1;
    maxScore += this.calculateLevelTimeBonus(minLevelTime);

    // 하트 보너스
    maxScore += totalHearts * this.heartBonus;

    return maxScore;
  }

  /**
   * 레벨 소요 시간에 따른 보너스 점수를 계산합니다.
   */
  private calculateLevelTimeBonus(levelTimeSeconds: number): number {
    for (let i = 0; i < this.levelTimeThresholds.length; i++) {
      if (levelTimeSeconds <= this.levelTimeThresholds[i]) {
        return this.levelTimeScores[i];
      }
    }
    return 0;
  }
}
