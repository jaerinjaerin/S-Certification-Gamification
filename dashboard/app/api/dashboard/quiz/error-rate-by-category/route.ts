import { prisma } from "@/prisma-client";
import { AuthType } from "@prisma/client";
import { NextResponse } from "next/server";

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
    // const allCategories = await prisma.userQuizQuestionStatistics.findMany({
    //   select: { category: true },
    //   distinct: ["category"],
    // });
    // 선택된 필드에 대한 별도 타입 정의
    interface SelectedStatistics {
      questionId: string;
      category: string | null;
      createdAt: Date;
    }

    // Prisma 데이터 가져오기 및 타입 설정
    const allStatistics: SelectedStatistics[] =
      await prisma.userQuizQuestionStatistics.findMany({
        select: {
          category: true,
          questionId: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

    // // 중복 제거 로직
    // const uniqueCategories: string[] = Object.values(
    //   allStatistics.reduce<Record<string, SelectedStatistics>>((acc, stat) => {
    //     if (!acc[stat.questionId]) {
    //       acc[stat.questionId] = stat; // createdAt 기준 가장 빠른 항목만 유지
    //     }
    //     return acc;
    //   }, {})
    // ).map((stat) => stat.category ?? "Unknown");

    // const results = await Promise.all(
    //   userGroups.map(async (group) => {
    //     // Fetch total counts for each category
    //     const totalCounts = await prisma.userQuizQuestionStatistics.groupBy({
    //       by: ["category"],
    //       _count: {
    //         _all: true,
    //       },
    //       where: {
    //         ...group.condition,
    //         campaignId,
    //         createdAt: {
    //           gte: start,
    //           lte: end,
    //         },
    //       },
    //     });

    //     // Fetch correct counts for each category
    //     const correctCounts = await prisma.userQuizQuestionStatistics.groupBy({
    //       by: ["category"],
    //       _count: {
    //         isCorrect: true,
    //       },
    //       where: {
    //         ...group.condition,
    //         campaignId,
    //         createdAt: {
    //           gte: start,
    //           lte: end,
    //         },
    //         isCorrect: true,
    //       },
    //     });

    //     // Merge total and correct counts with all categories
    //     const mergedResults = allStatistics.map(({ category }) => {
    //       const total = totalCounts.find((t) => t.category === category);
    //       const correct = correctCounts.find((c) => c.category === category);

    //       const totalAnswers = total?._count._all || 0;
    //       const correctAnswers = correct?._count.isCorrect || 0;
    //       const incorrectAnswers = totalAnswers - correctAnswers;
    //       const errorRate =
    //         totalAnswers > 0 ? (incorrectAnswers / totalAnswers) * 100 : 0;

    //       return {
    //         category,
    //         totalAnswers,
    //         correctAnswers,
    //         incorrectAnswers,
    //         errorRate: errorRate.toFixed(2),
    //       };
    //     });

    //     // Sort results by error rate in descending order
    //     const sortedResults = mergedResults.sort(
    //       (a, b) => parseFloat(b.errorRate) - parseFloat(a.errorRate)
    //     );

    //     return {
    //       groupName: group.name,
    //       categories: sortedResults,
    //     };
    //   })
    // );

    const results = await Promise.all(
      userGroups.map(async (group) => {
        // Fetch total counts for each category
        const totalCounts = await prisma.userQuizQuestionStatistics.groupBy({
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
            tryNumber: 1, // tryNumber가 1인 조건 추가
          },
        });

        // Fetch correct counts for each category
        const correctCounts = await prisma.userQuizQuestionStatistics.groupBy({
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
            tryNumber: 1, // tryNumber가 1인 조건 추가
          },
        });

        // Merge total and correct counts with all categories
        const mergedResults = allStatistics.map(({ category }) => {
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
