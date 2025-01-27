import { EndStageResult, ScoreData } from "../../types/type";

export function calculateStageResult(
  scoreData: ScoreData | null,
  totalQuizScore: number,
  isBadgeAcquired: boolean,
  isBadgeStage: boolean,
  currentQuizStage: { badgeImage?: { imagePath?: string } } | null
): EndStageResult {
  return {
    // score: scoreData ?? {
    //   data: [],
    //   userScore: totalQuizScore,
    // },
    score: scoreData ?? {
      data: [],
      sampleSize: null,
      userBin: null,
      userScore: totalQuizScore,
      percentile: null,
    },
    isBadgeAcquired,
    badgeStage: isBadgeStage,
    badgeImageURL: currentQuizStage?.badgeImage?.imagePath ?? "",
  };
}

describe("calculateStageResult", () => {
  it("should return default scoreData when scoreData is null", () => {
    const result = calculateStageResult(
      null, // scoreData
      100, // totalQuizScore
      false, // isBadgeAcquired
      false, // isBadgeStage
      { badgeImage: { imagePath: "test/path/to/image.png" } } // currentQuizStage
    );

    expect(result).toEqual({
      score: {
        data: [],
        sampleSize: null,
        userBin: null,
        userScore: 100,
        percentile: null,
      },
      isBadgeAcquired: false,
      badgeStage: false,
      badgeImageURL: "test/path/to/image.png",
    });
  });

  it("should return provided scoreData when scoreData is available", () => {
    const mockScoreData: ScoreData = {
      data: [
        { range: "0-9", count: 5, userIncluded: true },
        { range: "10-19", count: 10, userIncluded: false },
      ],
      sampleSize: 100,
      userBin: { range: "0-9", count: 5 },
      userScore: 50,
      percentile: 90,
    };

    const result = calculateStageResult(
      mockScoreData, // scoreData
      100, // totalQuizScore
      true, // isBadgeAcquired
      true, // isBadgeStage
      { badgeImage: { imagePath: "test/path/to/image.png" } } // currentQuizStage
    );

    expect(result).toEqual({
      score: mockScoreData,
      isBadgeAcquired: true,
      badgeStage: true,
      badgeImageURL: "test/path/to/image.png",
    });
  });

  it("should handle missing badgeImage in currentQuizStage", () => {
    const mockScoreData: ScoreData = {
      data: [
        { range: "0-9", count: 5, userIncluded: true },
        { range: "10-19", count: 10, userIncluded: false },
      ],
      sampleSize: 100,
      userBin: { range: "0-9", count: 5 },
      userScore: 50,
      percentile: 90,
    };

    const result = calculateStageResult(
      mockScoreData, // scoreData
      100, // totalQuizScore
      true, // isBadgeAcquired
      true, // isBadgeStage
      null // currentQuizStage
    );

    expect(result).toEqual({
      score: mockScoreData,
      isBadgeAcquired: true,
      badgeStage: true,
      badgeImageURL: "",
    });
  });

  it("should handle scoreData being null and currentQuizStage being null", () => {
    const result = calculateStageResult(
      null, // scoreData
      200, // totalQuizScore
      false, // isBadgeAcquired
      false, // isBadgeStage
      null // currentQuizStage
    );

    expect(result).toEqual({
      score: {
        data: [],
        sampleSize: null,
        userBin: null,
        userScore: 200,
        percentile: null,
      },
      isBadgeAcquired: false,
      badgeStage: false,
      badgeImageURL: "",
    });
  });
});
