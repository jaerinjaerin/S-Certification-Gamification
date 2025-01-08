import { prisma } from "@/prisma-client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    console.log("Fetching data...");
    const { searchParams } = new URL(request.url);

    const campaignId = searchParams.get("campaignId");
    // const startDate = searchParams.get("startDate");
    // const endDate = searchParams.get("endDate");

    if (!campaignId) {
      return NextResponse.json(
        { message: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // Fetch all regions
    const regions = await prisma.region.findMany({
      select: {
        id: true,
        name: true,
        subsidiaries: {
          select: {
            id: true,
            domains: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    const results = await Promise.all(
      regions.map(async (region) => {
        // Sum userCount from DomainGoal for domains in the region
        const domainIds = region.subsidiaries.flatMap((subsidiary) =>
          subsidiary.domains.map((domain) => domain.id)
        );

        const domainGoals = await prisma.domainGoal.findMany({
          where: {
            // campaignId,
            domainId: { in: domainIds },
          },
          select: {
            ff: true,
            fsm: true,
            ffSes: true,
            fsmSes: true,
          },
        });

        const totalUserCount = domainGoals.reduce(
          (sum, goal) => sum + (goal.ff + goal.fsm + goal.ffSes + goal.fsmSes),
          0
        );

        // Count completed UserQuizLogs for the region
        const completedLogsCount = await prisma.userQuizStatistics.count({
          where: {
            // campaignId,
            domainId: { in: domainIds },
            isCompleted: true,
            // createdAt:
            //   parsedStartDate && parsedEndDate
            //     ? {
            //         gte: parsedStartDate,
            //         lte: parsedEndDate,
            //       }
            //     : undefined,
          },
        });

        return {
          region: region.name,
          totalUserCount,
          completedLogsCount,
        };
      })
    );

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { message: "Internal server error", error },
      { status: 500 }
    );
  }
}
