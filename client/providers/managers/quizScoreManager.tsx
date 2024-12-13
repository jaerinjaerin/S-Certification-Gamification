// type QuizLog = {
//   isCorrect: boolean; // 정답 여부
//   selectedOptionIds: string[]; // 사용자가 선택한 옵션
//   correctOptionIds: string[]; // 정답 옵션
//   elapsedSeconds: number; // 한 문제 풀이 시간 (초 단위)
// };

import { QuizLog } from "./quizLogManager";

type LevelLog = {
  quizLogs: QuizLog[]; // 레벨의 모든 퀴즈 로그
  remainingHearts: number; // 남은 하트 개수
};

class QuizScoreManager {
  private baseScore = 20; // 기본 점수
  private comboBonus = 2; // 연속 정답 보너스
  private timeBonusThreshold = 60; // 문제 풀이 시간 보너스 기준 (초)
  private timeBonus = 5; // 문제 풀이 시간 보너스 점수
  private levelTimeThresholds = [120, 180, 300]; // 레벨 소요 시간 기준 (초)
  private levelTimeScores = [20, 10, 0]; // 레벨 소요 시간 점수
  private heartBonus = 10; // 하트 보너스 점수

  /**
   * 문제별 점수를 계산합니다.
   */
  calculateQuizScore(log: QuizLog): number {
    let score = 0;

    // 정답 체크
    if (log.isCorrect) {
      score += this.baseScore; // 기본 점수 추가

      // 문제 풀이 시간 보너스
      if (log.elapsedSeconds <= this.timeBonusThreshold) {
        score += this.timeBonus;
      }
    } else {
      // 오답이지만 멀티 선택 문제일 경우 정답 개수에 따른 점수 부여
      // 정답 개수에 따른 점수 분배
      const correctCount = log.correctOptionIds.length;
      const correctSelections = log.selectedOptionIds.filter((id) =>
        log.correctOptionIds.includes(id)
      ).length;

      // 정답 점수 분배 (기본 점수 / 정답 개수) * 맞춘 개수
      score += Math.round((this.baseScore / correctCount) * correctSelections);
    }

    return score;
  }

  /**
   * 레벨별 점수를 계산합니다.
   */
  calculateStageScore(levelLog: LevelLog): number {
    let totalScore = 0;
    let comboCount = 0;

    // 레벨 총 소요 시간 계산
    const levelTimeSeconds = levelLog.quizLogs.reduce(
      (total, log) => total + log.elapsedSeconds,
      0
    );

    for (const log of levelLog.quizLogs) {
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
    totalScore += levelLog.remainingHearts * this.heartBonus;

    return totalScore;
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

  /**
   * 전체 레벨 점수를 합산합니다.
   */
  // calculateTotalScore(levelLogs: LevelLog[]): number {
  //   return levelLogs.reduce(
  //     (total, levelLog) => total + this.calculateStageScore(levelLog),
  //     0
  //   );
  // }
}

export default QuizScoreManager;
