import { prisma } from "@/prisma-client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");
    const jobId = searchParams.get("jobId");
    const regionId = searchParams.get("regionId");
    const subsidiaryId = searchParams.get("subsidiaryId");
    const domainId = searchParams.get("domainId");
    const channelSegmentId = searchParams.get("channelSegmentId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!campaignId) {
      // return request.status(400).json({ error: "Campaign ID is required" });
      return NextResponse.json(
        { message: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // Build dynamic filters
    const filters: any = {
      campaignId: String(campaignId),
    };

    if (jobId) filters.regionId = String(jobId);
    if (regionId) filters.regionId = String(regionId);
    if (subsidiaryId) filters.subsidiaryId = String(subsidiaryId);
    if (domainId) filters.domainId = String(domainId);
    if (channelSegmentId) filters.channelSegmentId = String(channelSegmentId);
    if (startDate && endDate) {
      filters.createdAt = {
        gte: new Date(String(startDate)),
        lte: new Date(String(endDate)),
      };
    }

    // Calculate total participants
    const totalParticipants = await prisma.userQuizStatistics.count({
      where: filters,
    });

    // Calculate total experts
    const totalExperts = await prisma.userQuizStatistics.count({
      where: {
        ...filters,
        isCompleted: true,
      },
    });

    // Calculate goal achievement rate
    const domainGoals = await prisma.domainGoal.findMany({
      // where: {
      //   campaignId: String(campaignId),
      // },
    });

    const totalGoal = domainGoals.reduce(
      (acc: any, goal: any) =>
        acc + (goal.ff + goal.fsm + goal.ffSes + goal.fsmSes),
      0
    );

    const achievementRate = totalGoal
      ? ((totalExperts / totalGoal) * 100).toFixed(2)
      : "0.00";

    console.log("totalGoal:", totalGoal);

    // Calculate experts by job group
    const expertsByGroup = await prisma.userQuizStatistics.groupBy({
      by: ["jobId"],
      where: {
        ...filters,
        isCompleted: true,
      },
      _count: {
        _all: true,
      },
    });

    const expertsByGroupFormatted = expertsByGroup.map((group: any) => ({
      jobId: group.jobId,
      count: group._count._all,
    }));

    return NextResponse.json(
      {
        participants: totalParticipants,
        experts: totalExperts,
        goal: `${achievementRate}%`,
        expertsByGroup: expertsByGroupFormatted,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching statistics summary:", error);
    // res.status(500).json({ error: "Internal server error" });
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
