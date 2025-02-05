/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = 'force-dynamic';

import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { querySearchParams } from '../../../../_lib/query';
import { addDays, endOfDay, startOfDay } from 'date-fns';
import { removeDuplicateUsers } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where: condition, period } = querySearchParams(searchParams);
    const { jobId, storeId, ...where } = condition;

    await prisma.$connect();

    const jobGroup = await prisma.job.findMany({
      where: jobId ? { code: jobId } : {},
      select: { id: true, code: true },
    });

    // 오늘과 6일 전 설정
    const today = new Date(Math.min(new Date().getTime(), period.to.getTime()));
    const beforeWeek = new Date(
      Math.max(
        addDays(today, -6).getTime(), // today에서 6일 전
        new Date(period.from).getTime() // period.from
      )
    );

    let experts = await prisma.userQuizBadgeStageStatistics.groupBy({
      by: ['userId', 'elapsedSeconds', 'createdAt'], // quizStageId와 createdAt으로 그룹화
      where: {
        ...where,
        createdAt: {
          gte: startOfDay(beforeWeek), // 6일 전부터
          lte: endOfDay(today), // 오늘까지
        },
        quizStageIndex: { in: [2, 3] },
        jobId: { in: jobGroup.map((job) => job.id) },
        ...(storeId
          ? storeId === '4'
            ? { storeId }
            : { OR: [{ storeId }, { storeId: null }] }
          : {}),
      },
      orderBy: { createdAt: 'asc' }, // 날짜 순 정렬
    });

    experts = removeDuplicateUsers(experts);
    experts = filterHighestElapsedSeconds(experts);

    // 날짜 범위를 생성
    const getDateRange = (start: Date, end: Date) => {
      const dates = [];
      const current = new Date(start);
      while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
      return dates;
    };

    // 날짜별 초기 데이터 생성
    const initialData = getDateRange(beforeWeek, today).map((date) => ({
      date: date.replace(/-/g, '.'), // YYYY-MM-DD -> YYYY.MM.DD
      time: 0,
    }));

    // 데이터 그룹화 및 합산
    const result = experts
      .reduce((acc, item) => {
        const dateKey = item.createdAt.toISOString().split('T')[0]; // 날짜 추출
        const match = acc.find(
          (entry) => entry.date === dateKey.replace(/-/g, '.')
        ); // 날짜 일치 항목 찾기

        if (match) {
          const time = item?.elapsedSeconds || 0;
          match.time += time;
        }
        return acc;
      }, initialData)
      .map((r) => {
        return { ...r, time: Math.round(r.time / 360) };
      });

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    prisma.$disconnect();
  }
}

function filterHighestElapsedSeconds(data: any) {
  // Create a Map to store the highest elapsedSeconds for each userId
  const userMap = new Map();

  data.forEach((item: any) => {
    const existingItem = userMap.get(item.userId);
    if (!existingItem || item.elapsedSeconds > existingItem.elapsedSeconds) {
      // Update the map if the userId is not present or the current elapsedSeconds is higher
      userMap.set(item.userId, item);
    }
  });

  // Return the values of the map as an array
  return Array.from(userMap.values());
}
