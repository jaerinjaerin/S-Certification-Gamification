import { prisma } from "@/prisma-client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract filter parameters
    const campaignId = searchParams.get("campaignId");
    const regionId = searchParams.get("regionId");
    const subsidiaryId = searchParams.get("subsidiaryId");
    const domainId = searchParams.get("domainId");
    const channelSegmentId = searchParams.get("channelSegmentId");
    const languageId = searchParams.get("languageId");
    const jobId = searchParams.get("jobId") || undefined;
    const storeId = searchParams.get("storeId") || undefined;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    // const page = parseInt(searchParams.get("page") || "1");
    // const pageSize = 10;

    // Validate required fields
    if (!campaignId) {
      return NextResponse.json(
        { message: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // Total counts for all records
    const totalCounts = await prisma.userQuizQuestionStatistics.groupBy({
      by: ["questionId"],
      _count: {
        _all: true, // Count all records
      },
      where: {
        regionId: regionId || undefined,
        subsidiaryId: subsidiaryId || undefined,
        domainId: domainId || undefined,
        channelSegmentId: channelSegmentId || undefined,
        languageId: languageId || undefined,
        jobId: jobId || undefined,
        storeId: storeId || undefined,
        createdAt:
          startDate && endDate
            ? { gte: new Date(startDate), lte: new Date(endDate) }
            : undefined,
      },
    });

    // console.log("totalCounts", totalCounts);

    // Count "true" values for isCorrect per questionId
    const correctCounts = await prisma.userQuizQuestionStatistics.groupBy({
      by: ["questionId"],
      _count: {
        isCorrect: true, // Count occurrences of 'isCorrect'
      },
      where: {
        regionId: regionId || undefined,
        subsidiaryId: subsidiaryId || undefined,
        domainId: domainId || undefined,
        channelSegmentId: channelSegmentId || undefined,
        languageId: languageId || undefined,
        jobId: jobId || undefined,
        storeId: storeId || undefined,
        isCorrect: true, // Filter for true values
        createdAt:
          startDate && endDate
            ? { gte: new Date(startDate), lte: new Date(endDate) }
            : undefined,
      },
    });

    // Merge results for "correct counts" and "total counts", calculate error rate
    const mergedResults = totalCounts.map((total) => {
      const correct = correctCounts.find(
        (c) => c.questionId === total.questionId
      );
      const totalCount = total._count._all;
      const correctCount = correct?._count.isCorrect || 0;
      const errorRate =
        totalCount > 0 ? (totalCount - correctCount) / totalCount : 0;
      return {
        questionId: total.questionId,
        totalCount,
        correctCount,
        errorRate,
      };
    });

    // Sort by error rate in descending order
    const sortedResults = mergedResults.sort(
      (a, b) => b.errorRate - a.errorRate
    );

    // console.log("sortedResults", sortedResults);

    // Fetch full details from the log for each questionId
    const enrichedResults = await Promise.all(
      sortedResults.map(async (item) => {
        const logs = await prisma.userQuizQuestionStatistics.findFirst({
          where: { questionId: item.questionId },
        });

        const totalAnswers = item.totalCount;
        const correctAnswers = item.correctCount;
        const incorrectAnswers = totalAnswers - correctAnswers;
        const errorRate =
          totalAnswers > 0 ? (incorrectAnswers / totalAnswers) * 100 : 0;
        // console.log("errorRate:", errorRate);
        // console.log("totalAnswers:", totalAnswers);
        // console.log("correctAnswers:", correctAnswers);
        // console.log("incorrectAnswers:", incorrectAnswers);

        return {
          questionId: item.questionId,
          // text: logs?.text || null,
          category: logs?.category || null,
          product: logs?.product || null,
          questionType: logs?.questionType || null,
          specificFeature: logs?.specificFeature || null,
          // importance: logs?.importance || null,
          quizStageIndex: logs?.quizStageIndex || null,
          totalAnswers,
          correctAnswers,
          incorrectAnswers,
          errorRate: errorRate.toFixed(2), // Keep two decimal places
        };
      })
    );

    return NextResponse.json({
      data: enrichedResults,
      // page,
      // pageSize,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
