import { prisma } from "@/prisma-client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    console.log("Fetching data...", searchParams);

    const campaignId = searchParams.get("campaignId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!campaignId) {
      return NextResponse.json(
        { message: "Campaign ID is required" },
        { status: 400 }
      );
    }

    const regions = await prisma.region.findMany({
      include: {
        subsidiaries: {
          include: {
            domains: true,
          },
        },
      },
    });

    const data = await Promise.all(
      regions.map(async (region) => {
        const domainIds = region.subsidiaries
          .flatMap((subsidiary) => subsidiary.domains)
          .map((domain) => domain.id);

        const participantsCount = await prisma.userQuizStatistics.count({
          where: {
            // campaignId,
            domainId: { in: domainIds },
            createdAt: {
              gte: startDate ? new Date(startDate) : undefined,
              lte: endDate ? new Date(endDate) : undefined,
            },
          },
        });

        const expertsCount = await prisma.userQuizStatistics.count({
          where: {
            // campaignId,
            domainId: { in: domainIds },
            isCompleted: true,
            createdAt: {
              gte: startDate ? new Date(startDate) : undefined,
              lte: endDate ? new Date(endDate) : undefined,
            },
          },
        });

        return {
          region: region.name,
          participants: participantsCount,
          experts: expertsCount,
        };
      })
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching participants vs experts data:", error);
    return NextResponse.json(
      { message: "Failed to fetch data", error },
      { status: 500 }
    );
  }
}
