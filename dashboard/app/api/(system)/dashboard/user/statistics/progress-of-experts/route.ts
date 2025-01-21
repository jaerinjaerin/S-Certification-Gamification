/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/prisma-client";
import { NextRequest, NextResponse } from "next/server";
import { addDays, isWithinInterval } from "date-fns";
import { querySearchParams } from "../../../_lib/query";
import { defaultDateFormat } from "@/lib/time";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where } = querySearchParams(searchParams);

    await prisma.$connect();

    // 데이터 가져오기
    const expertData = await prisma.userQuizBadgeStageStatistics.findMany({
      where: {
        ...where,
        isBadgeAcquired: true,
      },
    });

    // 오늘과 6일 전 설정
    const today = new Date();
    const beforeWeek = addDays(today, -6);

    // 결과 저장 배열
    const result = [];

    // 7일 동안 데이터를 처리하는 for문
    for (let i = 0; i < 7; i++) {
      const currentDate = addDays(beforeWeek, i);

      // 해당 날짜에 맞는 데이터 필터링
      const expertsTotal = expertData.filter((exp) =>
        isWithinInterval(new Date(exp.createdAt), {
          start: currentDate,
          end: addDays(currentDate, 1),
        })
      );

      // 추가적인 조건에 맞는 데이터
      const experts = expertsTotal.filter(
        (exp) => exp.quizStageId === "stage_2"
      );
      const expertsAdvanced = expertsTotal.filter(
        (exp) => exp.quizStageId === "stage_3"
      );

      // 결과에 저장
      result.push({
        date: defaultDateFormat(currentDate), // YYYY.MM.DD
        total: expertsTotal.length,
        expert: experts.length,
        advanced: expertsAdvanced.length,
      });
    }
    console.log("result", result);

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
