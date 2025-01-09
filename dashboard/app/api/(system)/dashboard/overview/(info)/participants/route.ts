import { prisma } from "@/prisma-client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    await prisma.$connect();

    const count = await prisma.userQuizStatistics.count();
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
