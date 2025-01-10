import { prisma } from "@/prisma-client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    await prisma.$connect();

    const user_quiz_statistics = await prisma.userQuizStatistics.findMany();
    const domain_goal = await prisma.domainGoal.findMany();
    // console.log("🚀 ~ GET ~ domain_goal:", domain_goal);

    return NextResponse.json({});
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
