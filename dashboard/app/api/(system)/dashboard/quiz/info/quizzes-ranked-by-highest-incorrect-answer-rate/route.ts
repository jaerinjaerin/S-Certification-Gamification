/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/prisma-client";
import { NextRequest, NextResponse } from "next/server";
import { querySearchParams } from "../../../_lib/query";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where, take, skip } = querySearchParams(searchParams);

    await prisma.$connect();

    const questions = await prisma.question.findMany({});

    const count = await prisma.userQuizQuestionStatistics.groupBy({
      by: ["questionId"], // questionId와 isCorrect를 기준으로 그룹핑
      where: {
        ...where,
        questionId: { in: questions.map((q) => q.id) },
      },
      orderBy: [
        { questionId: "asc" }, // questionId 기준 정렬
      ],
    });

    const corrects = await prisma.userQuizQuestionStatistics.groupBy({
      by: ["questionId"], // questionId와 isCorrect를 기준으로 그룹핑
      where: {
        ...where,
        questionId: { in: questions.map((q) => q.id) },
        isCorrect: true,
      },
      _count: { isCorrect: true },
      orderBy: [
        { questionId: "asc" }, // questionId 기준 정렬
      ],
      take,
      skip,
    });

    const incorrects = await prisma.userQuizQuestionStatistics.groupBy({
      by: ["questionId"], // questionId와 isCorrect를 기준으로 그룹핑
      where: {
        ...where,
        questionId: { in: questions.map((q) => q.id) },
        isCorrect: false,
      },
      _count: { isCorrect: true },
      orderBy: [
        { questionId: "asc" }, // questionId 기준 정렬
      ],
      take,
      skip,
    });

    const result = corrects.map((correct) => {
      const incorrect = incorrects.find(
        (ic) => ic.questionId === correct.questionId
      );

      let errorRate = 0;
      if (incorrect) {
        errorRate =
          (incorrect._count.isCorrect / correct._count.isCorrect) * 100;
      }

      const question = questions.find((q) => q.id === correct.questionId);
      if (question) {
        return {
          question: question.text,
          product: question.product,
          category: question.category,
          questionType: question.questionType,
          importance: question.importance,
          errorRate,
        };
      }
    });

    return NextResponse.json({ result, total: count.length });
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
