/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/prisma-client";
import { NextRequest, NextResponse } from "next/server";
import { querySearchParams } from "../../../_lib/query";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where } = querySearchParams(searchParams);

    await prisma.$connect();

    const quizSets = await prisma.quizSet.findMany({
      where: { ...where },
      include: { quizStages: true },
    });
    console.log("🚀 ~ GET ~ quizSets:", quizSets.slice(0, 2));

    const qustionIds = quizSets.flatMap((qset) =>
      qset.quizStages.flatMap((stage) => stage.questionIds)
    );

    const questions = await prisma.question.findMany({
      where: { id: { in: qustionIds } },
      include: { options: true },
    });
    console.log("🚀 ~ GET ~ questions:", questions.slice(0, 2));

    return NextResponse.json({ result: [] });
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
