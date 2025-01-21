/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/prisma-client";
import { NextRequest, NextResponse } from "next/server";
import { querySearchParams } from "../../../_lib/query";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where } = querySearchParams(searchParams);

    await prisma.$connect();

    const userQuizQuestions = await prisma.userQuizQuestionStatistics.findMany({
      where,
    });

    const questions = await prisma.question.findMany({
      where: { id: { in: userQuizQuestions.map((q) => q.questionId) } },
    });

    const errorRates: Record<string, any> = {};
    userQuizQuestions.forEach((userQuizQuestion) => {
      const { questionId, isCorrect } = userQuizQuestion;

      if (!errorRates[questionId]) {
        errorRates[questionId] = {
          errorRate: 0,
          correct: 0,
          incorrect: 0,
        };
      }
      const item = errorRates[questionId];

      item[isCorrect ? "correct" : "incorrect"] += 1;

      // Calculate the incorrect rate
      const incorrect = item.incorrect;
      const total = item.correct + incorrect;
      const rate = incorrect / total;
      item.errorRate = rate * 100;
    });

    const result = userQuizQuestions
      .map((userQuizQuestion) => {
        const { id, questionId, category, product, questionType } =
          userQuizQuestion;

        const question = questions.find((q) => q.id === questionId);
        if (question) {
          const { errorRate } = errorRates[questionId];
          const { text, importance } = question;
          return {
            id,
            question: text,
            product,
            category,
            questionType,
            importance,
            errorRate,
          };
        }
        return null;
      })
      .filter(Boolean);

    return NextResponse.json({ result });
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
