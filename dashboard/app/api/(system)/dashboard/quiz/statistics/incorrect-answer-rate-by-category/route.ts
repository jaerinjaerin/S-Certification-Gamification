/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/prisma-client";
import { NextRequest, NextResponse } from "next/server";
import { querySearchParams } from "../../../_lib/query";
import { AuthType } from "@prisma/client";

type GroupedResultProps = {
  category: string;
  plus: Record<
    string,
    { correct: number; incorrect: number; questionIds: string[] }
  >;
  none: Record<
    string,
    { correct: number; incorrect: number; questionIds: string[] }
  >;
};

const calculateRate = (incorrect: number, correct: number): number => {
  const correctValue = correct || 0;
  const incorrectValue = incorrect || 0;
  return (incorrectValue / (correctValue + incorrectValue)) * 100 || 0;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where } = querySearchParams(searchParams);

    await prisma.$connect();

    const jobNames = await prisma.job.findMany({
      select: { id: true, group: true },
    });

    const questions = await prisma.question.findMany({});

    const corrects = await prisma.userQuizQuestionStatistics.groupBy({
      by: ["category", "jobId", "authType", "isCorrect", "questionId"],
      where: {
        ...where,
        questionId: { in: questions.map((q) => q.id) },
      },
      _count: { isCorrect: true },
      orderBy: [
        { category: "asc" }, // questionId 기준 정렬
      ],
    });

    // Job ID를 매핑
    const jobGroupMap = jobNames.reduce((acc, job) => {
      acc[job.id] = job.group; // id: group 형태로 매핑
      return acc;
    }, {} as Record<string, string>);

    // 데이터 그룹화
    const groupedData: GroupedResultProps[] = corrects.reduce<any>(
      (acc, item) => {
        const { category, questionId, _count, isCorrect, authType, jobId } =
          item;
        // Job 그룹 찾기
        const jobGroup = jobGroupMap[jobId] || "Unknown";
        // 카테고리 찾거나 생성
        let categoryItem = acc.find((c: any) => c.category === category);
        if (!categoryItem) {
          categoryItem = {
            category,
            plus: {
              ff: { correct: 0, incorrect: 0, questionIds: [] },
              fsm: { correct: 0, incorrect: 0, questionIds: [] },
            },
            none: {
              ff: { correct: 0, incorrect: 0, questionIds: [] },
              fsm: { correct: 0, incorrect: 0, questionIds: [] },
            },
          };
          acc.push(categoryItem);
        }

        // AuthType별로 처리
        const authTypeGroup =
          categoryItem[authType === AuthType.SUMTOTAL ? "plus" : "none"];

        // isCorrect에 따라 값 누적
        authTypeGroup[jobGroup][isCorrect ? "correct" : "incorrect"] +=
          _count.isCorrect;
        //
        if (questionId) {
          authTypeGroup[jobGroup].questionIds.push(questionId);
        }

        return acc;
      },
      []
    );

    const result = groupedData.map(({ category, plus, none }) => {
      return {
        id: category,
        data: [
          {
            x: "S+ FF",
            y: calculateRate(plus.ff.incorrect, plus.ff.correct),
            meta: { questionIds: Array.from(new Set(plus.ff.questionIds)) },
          },
          {
            x: "S+ FSM",
            y: calculateRate(plus.fsm.incorrect, plus.fsm.correct),
            meta: { questionIds: Array.from(new Set(plus.fsm.questionIds)) },
          },
          {
            x: "Non S+ FF",
            y: calculateRate(none.ff.incorrect, none.ff.correct),
            meta: { questionIds: Array.from(new Set(none.ff.questionIds)) },
          },
          {
            x: "Non S+ FSM",
            y: calculateRate(none.fsm.incorrect, none.fsm.correct),
            meta: { questionIds: Array.from(new Set(none.fsm.questionIds)) },
          },
        ],
      };
    });

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
