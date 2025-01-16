import { prisma } from "@/prisma-client";
import { AuthType } from "@prisma/client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // 동적 렌더링 강제

export async function GET(request: Request) {
  try {
    const url = request.url;

    const { searchParams } = new URL(url);
    // Extract filter parameters
    const campaignId = searchParams.get("campaignId");
    const quizStageIndex = parseInt(searchParams.get("quizStageIndex") || "0");
    const userScore = parseInt(searchParams.get("userScore") || "0");
    const authString = searchParams.get("authType"); // string | null

    const sampleSize = 1000; // 샘플링 크기

    // Validate required fields
    if (!campaignId || isNaN(quizStageIndex) || !authString) {
      return NextResponse.json(
        { message: "Campaign ID and quizStageIndex are required" },
        { status: 400 }
      );
    }

    // Prisma에서 사용하는 enum 타입으로 변환 (문자열 기반)
    const authType = (authString ?? "SUMTOTAL") as AuthType;

    // or, 안전하게 체크:
    let typedAuth: AuthType = "SUMTOTAL";
    if (authString === "GUEST") {
      typedAuth = "GUEST";
    } else if (authString === "UNKNOWN") {
      typedAuth = "UNKNOWN";
    }

    // 샘플링된 점수 가져오기
    const sampledScores = await prisma.userQuizStageLog.findMany({
      where: {
        campaignId,
        quizStageIndex,
        authType,
      },
      select: {
        score: true,
        totalScore: true,
      },
      take: sampleSize, // 샘플링 크기만큼 데이터 가져오기
      orderBy: {
        createdAt: "asc", // 데이터가 일정하게 섞이도록 정렬
      },
    });

    // 샘플 점수에서 null 값을 0으로 처리
    const scores = sampledScores.map((record) => record.totalScore || 0);

    // 점수를 10 단위로 그룹화
    const bins = Array(10).fill(0);
    scores.forEach((score) => {
      const binIndex = Math.min(Math.floor(score / 10), 9); // Ensure score 100 is in the last bin
      bins[binIndex]++;
    });

    // 사용자 점수가 포함된 구간 확인
    const userBinIndex = Math.min(Math.floor(userScore / 10), 9);
    const userBinRange = `${userBinIndex * 10}-${userBinIndex * 10 + 9}`;
    const userBinCount = bins[userBinIndex];

    // 사용자 상위 % 계산
    scores.sort((a, b) => a - b); // 점수를 오름차순으로 정렬
    const userRank = scores.findIndex((score) => userScore <= score);
    const percentile =
      userRank >= 0 ? ((userRank / scores.length) * 100).toFixed(2) : "100.00";

    // 결과 포맷팅
    const result = bins.map((count, index) => ({
      range: `${index * 10}-${index * 10 + 9}`, // e.g., "0-10", "11-20"
      count,
      userIncluded: index === userBinIndex, // 사용자 포함 여부
    }));

    return NextResponse.json({
      data: result,
      userScore,
      userBin: {
        range: userBinRange,
        count: userBinCount,
      },
      sampleSize,
      percentile: parseFloat(percentile), // 상위 %
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
