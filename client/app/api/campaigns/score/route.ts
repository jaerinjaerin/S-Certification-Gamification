import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");
    const quizStageIndex = parseInt(searchParams.get("quizStageIndex") || "");
    const userId = searchParams.get("userId");

    if (!campaignId || !quizStageIndex || !userId) {
      return NextResponse.json(
        { message: "Missing required parameters." },
        { status: 400 }
      );
    }

    // Get all scores for the specified campaign and quiz stage index
    const scores = await prisma.userQuizStageLog.findMany({
      where: {
        campaignId,
        quizStageIndex,
      },
      select: {
        userId: true,
        score: true,
      },
    });

    if (!scores.length) {
      return NextResponse.json(
        { message: "No data found for the specified parameters." },
        { status: 404 }
      );
    }

    // Sort scores in descending order
    const sortedScores = scores.sort((a: any, b: any) => b.score - a.score);

    // Find the rank of the current user
    const userRank =
      sortedScores.findIndex((entry) => entry.userId === userId) + 1;
    const userScore = sortedScores[userRank - 1]?.score;

    // Calculate total users
    const totalUsers = scores.length;

    // Percentile 데이터를 계산
    const percentileData: any[] = [];
    for (let i = 1; i <= 10; i++) {
      const percentile = i * 10; // 10%, 20%, ..., 100%
      const index = Math.floor((percentile / 100) * totalUsers) - 1; // 해당 퍼센트에 해당하는 인덱스
      const scoreAtPercentile = scores[index]?.score || 0; // 점수 가져오기
      const percentage = ((index + 1) / totalUsers) * 100; // 해당 퍼센트에 해당하는 비율 계산

      percentileData.push({
        percentile, // 상위 몇 %
        score: scoreAtPercentile, // 해당 구간의 점수
        percentage: parseFloat(percentage.toFixed(2)), // 유저 비율
      });
    }

    // Determine user's percentile rank
    const userPercentile = Math.ceil((userRank / totalUsers) * 100);

    return NextResponse.json({
      userScore,
      userRank,
      userPercentile,
      totalUsers,
      percentileData,
    });
  } catch (error) {
    console.error("Error fetching stage ranking data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
