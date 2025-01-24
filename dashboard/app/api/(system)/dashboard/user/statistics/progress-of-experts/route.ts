/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/prisma-client";
import { NextRequest, NextResponse } from "next/server";
import { addDays, endOfDay, startOfDay } from "date-fns";
import { querySearchParams } from "../../../_lib/query";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where, period } = querySearchParams(searchParams);

    await prisma.$connect();

    // 오늘과 6일 전 설정
    const today = new Date(Math.min(new Date().getTime(), period.to.getTime()));
    const beforeWeek = new Date(
      Math.max(
        addDays(today, -6).getTime(), // today에서 6일 전
        new Date(period.from).getTime() // period.from
      )
    );

    const experts = await prisma.userQuizBadgeStageStatistics.groupBy({
      by: ["quizStageIndex", "createdAt"], // quizStageId와 createdAt으로 그룹화
      where: {
        ...where,
        createdAt: {
          gte: startOfDay(beforeWeek), // 6일 전부터
          lte: endOfDay(today), // 오늘까지
        },
        quizStageIndex: { in: [2, 3] },
      },
      _count: { quizStageIndex: true }, // 각 그룹에 대한 개수 집계
      orderBy: { createdAt: "asc" }, // 날짜 순 정렬
    });

    // 날짜 범위를 생성
    const getDateRange = (start: Date, end: Date) => {
      const dates = [];
      const current = new Date(start);
      while (current <= end) {
        dates.push(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
      }
      return dates;
    };

    // 날짜별 초기 데이터 생성
    const initialData = getDateRange(beforeWeek, today).map((date) => ({
      date: date.replace(/-/g, "."), // YYYY-MM-DD -> YYYY.MM.DD
      total: 0,
      expert: 0,
      advanced: 0,
    }));

    // 데이터 그룹화 및 합산
    const result = experts.reduce((acc, item) => {
      const dateKey = item.createdAt.toISOString().split("T")[0]; // 날짜 추출
      const match = acc.find(
        (entry) => entry.date === dateKey.replace(/-/g, ".")
      ); // 날짜 일치 항목 찾기
      if (match) {
        const count = item._count.quizStageIndex;
        if (item.quizStageIndex === 2) {
          match.expert += count; // stage_2는 expert
        } else if (item.quizStageIndex === 3) {
          match.advanced += count; // stage_3은 advanced
          match.expert -= count;
        }
        match.total = match.expert + match.advanced; // total 계산
      }
      return acc;
    }, initialData);

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
