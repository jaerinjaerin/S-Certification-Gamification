import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

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

    // if (startDate && isNaN(Date.parse(startDate))) {
    //   return NextResponse.json(
    //     { message: "Invalid start date format" },
    //     { status: 400 }
    //   );
    // }

    // if (endDate && isNaN(Date.parse(endDate))) {
    //   return NextResponse.json(
    //     { message: "Invalid end date format" },
    //     { status: 400 }
    //   );
    // }

    // const parsedStartDate = startDate
    //   ? new Date(startDate).toISOString()
    //   : null;
    // const parsedEndDate = endDate ? new Date(endDate).toISOString() : null;

    // Fetch all regions
    const regions = await prisma.region.findMany({
      select: {
        id: true,
        name: true,
        subsidaries: {
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
        const domainIds = region.subsidaries.flatMap((subsidary) =>
          subsidary.domains.map((domain) => domain.id)
        );

        const domainGoals = await prisma.domainGoal.findMany({
          where: {
            // campaignId,
            domainId: { in: domainIds },
          },
          select: {
            userCount: true,
          },
        });

        const totalUserCount = domainGoals.reduce(
          (sum, goal) => sum + goal.userCount,
          0
        );

        // Count completed UserQuizLogs for the region
        const completedLogsCount = await prisma.userQuizLog.count({
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
