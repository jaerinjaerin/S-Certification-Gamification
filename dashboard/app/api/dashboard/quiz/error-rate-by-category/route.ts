import { AuthType, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const campaignId = searchParams.get("campaignId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!campaignId || !startDate || !endDate) {
      return NextResponse.json(
        { message: "Campaign ID, startDate, and endDate are required" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const ffJobIds = ["4", "5", "6", "9"];

    const userGroups = [
      {
        name: "S+ FF",
        condition: {
          authType: AuthType.SUMTOTAL,
          jobId: { in: ffJobIds },
        },
      },
      {
        name: "S+ FSM",
        condition: {
          authType: AuthType.SUMTOTAL,
          jobId: { notIn: ffJobIds },
        },
      },
      {
        name: "Non S+ FF",
        condition: {
          authType: AuthType.GUEST,
          jobId: { in: ffJobIds },
        },
      },
      {
        name: "Non S+ FSM",
        condition: {
          authType: AuthType.GUEST,
          jobId: { notIn: ffJobIds },
        },
      },
    ];

    // Fetch all categories
    const allCategories = await prisma.userQuizQuestionLog.findMany({
      select: { category: true },
      distinct: ["category"],
    });

    const results = await Promise.all(
      userGroups.map(async (group) => {
        // Fetch total counts for each category
        const totalCounts = await prisma.userQuizQuestionLog.groupBy({
          by: ["category"],
          _count: {
            _all: true,
          },
          where: {
            ...group.condition,
            campaignId,
            createdAt: {
              gte: start,
              lte: end,
            },
          },
        });

        // Fetch correct counts for each category
        const correctCounts = await prisma.userQuizQuestionLog.groupBy({
          by: ["category"],
          _count: {
            isCorrect: true,
          },
          where: {
            ...group.condition,
            campaignId,
            createdAt: {
              gte: start,
              lte: end,
            },
            isCorrect: true,
          },
        });

        // Merge total and correct counts with all categories
        const mergedResults = allCategories.map(({ category }) => {
          const total = totalCounts.find((t) => t.category === category);
          const correct = correctCounts.find((c) => c.category === category);

          const totalAnswers = total?._count._all || 0;
          const correctAnswers = correct?._count.isCorrect || 0;
          const incorrectAnswers = totalAnswers - correctAnswers;
          const errorRate =
            totalAnswers > 0 ? (incorrectAnswers / totalAnswers) * 100 : 0;

          return {
            category,
            totalAnswers,
            correctAnswers,
            incorrectAnswers,
            errorRate: errorRate.toFixed(2),
          };
        });

        // Sort results by error rate in descending order
        const sortedResults = mergedResults.sort(
          (a, b) => parseFloat(b.errorRate) - parseFloat(a.errorRate)
        );

        return {
          groupName: group.name,
          categories: sortedResults,
        };
      })
    );

    return NextResponse.json({ data: results });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
