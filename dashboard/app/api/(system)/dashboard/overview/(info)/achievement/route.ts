/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/prisma-client";
import { NextRequest, NextResponse } from "next/server";
import { parseDateFromQuery } from "../../../_lib/query";
import { buildWhereCondition } from "../../../_lib/where";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const params = Object.fromEntries(searchParams.entries());
    const period = parseDateFromQuery(params);
    const where = buildWhereCondition(params, period);

    await prisma.$connect();

    const expertCount = await prisma.userQuizStatistics.count({
      where: { ...where, isCompleted: true },
    });

    const goal_where = ["campaignId", "domainId", "createdAt"].reduce(
      (acc, key) => {
        if (where?.[key] !== undefined) {
          acc[key] = where[key];
        }
        return acc;
      },
      {} as Record<string, any>
    );
    const domain_goal = await prisma.domainGoal.findMany({
      where: goal_where,
    });
    //
    const total = domain_goal.reduce((sum, item) => {
      return (
        sum +
        (item.ff || 0) +
        (item.fsm || 0) +
        (item.ffSes || 0) +
        (item.fsmSes || 0)
      );
    }, 0);

    const count = (expertCount / total) * 100;

    return NextResponse.json({ result: { count } });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    prisma.$disconnect();
  }
}
