/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/prisma-client";
import { NextRequest, NextResponse } from "next/server";
import { querySearchParams } from "../../../../_lib/query";
import { addDays, endOfDay, startOfDay } from "date-fns";
import { defaultDateFormat } from "@/lib/time";

type ResultProps = { date: string; seconds: number };
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where } = querySearchParams(searchParams);

    await prisma.$connect();

    // 오늘과 6일 전 설정
    const today = new Date();
    const beforeWeek = startOfDay(addDays(today, -6)); // 7일 전 시작
    const todayEnd = endOfDay(today); // 오늘 끝

    const users = await prisma.userQuizBadgeStageStatistics.findMany({
      where: {
        ...where,
        updatedAt: { gte: beforeWeek, lte: todayEnd },
      },
    });

    // 7일 동안 데이터를 처리하는 for문
    const result = users.reduce((acc: ResultProps[], user) => {
      const date = defaultDateFormat(user.updatedAt); // yyyy-mm-dd 형식의 날짜 추출
      if (!date) return acc;

      // 기존에 날짜가 있는지 확인
      const existingEntry = acc.find((entry) => entry.date === date);

      if (existingEntry) {
        // 날짜가 이미 있다면 score를 합산
        existingEntry.seconds += user.elapsedSeconds || 0;
      } else {
        // 날짜가 없다면 새로 추가
        acc.push({ date, seconds: user.elapsedSeconds || 0 });
      }

      return acc;
    }, []);

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
