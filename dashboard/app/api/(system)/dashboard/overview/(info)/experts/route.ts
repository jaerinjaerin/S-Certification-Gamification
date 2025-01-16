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

    const count = await prisma.userQuizStatistics.count({
      where: { ...where, isCompleted: true },
    });
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
