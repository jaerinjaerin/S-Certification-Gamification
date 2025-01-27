import QuizScoreCalculator from "../../utils/quizScoreCalculator";

describe("QuizScoreCalculator Tests", () => {
  let calculator: QuizScoreCalculator;

  beforeEach(() => {
    calculator = new QuizScoreCalculator();
  });

  it("calculates perfect score for a level with 10 questions and full hearts", () => {
    const totalQuestions = 10;
    const totalHearts = 5;

    const maxScore = calculator.calculateMaxScore(totalQuestions, totalHearts);

    // 만점 계산: (20 + 5) * 10 + 2 * (10-1) + 시간 보너스 + 하트 보너스
    const expectedScore = 20 * 10 + 2 * 9 + 40 + totalHearts * 10;

    expect(maxScore).toBe(expectedScore);
  });

  it("calculates score with one wrong answer and 1 heart used", () => {
    const quizLogs = [
      ...Array(9).fill({
        isCorrect: true,
        selectedOptionIds: ["A"],
        correctOptionIds: ["A"],
        elapsedSeconds: 20,
      }),
      {
        isCorrect: false,
        selectedOptionIds: ["B"],
        correctOptionIds: ["A"],
        elapsedSeconds: 20,
      },
    ];
    const remainingHearts = 4;

    const stageScore = calculator.calculateStageScore(
      quizLogs,
      remainingHearts
    );

    // 예상 점수 계산
    const correctScore = 20 * 9 + 2 * 8; // 정답 점수와 연속 정답 보너스
    // const wrongScore = Math.round(20 / 1); // 틀린 문제에서 얻은 점수
    const wrongScore = 0;
    const levelTimeScore = 35; // 시간 보너스 (210 초 이하)
    const heartBonus = remainingHearts * 10;

    const expectedScore =
      correctScore + wrongScore + levelTimeScore + heartBonus;

    expect(stageScore).toBe(expectedScore);
  });
});
