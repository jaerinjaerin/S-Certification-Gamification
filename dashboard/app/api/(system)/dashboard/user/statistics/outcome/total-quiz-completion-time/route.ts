/* eslint-disable @typescript-eslint/no-explicit-any */

import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { querySearchParams } from '@/lib/query';
import { addDays, endOfDay, startOfDay } from 'date-fns';
import { getJobIds, removeDuplicateUsers } from '@/lib/data';
import { CampaignSettings } from '@prisma/client';
import { queryRawWithWhere } from '@/lib/sql';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where: condition, period } = querySearchParams(searchParams);
    const { jobId, storeId, ...where } = condition;

    const [settings]: CampaignSettings[] = await queryRawWithWhere(
      prisma,
      'CampaignSettings',
      { campaignId: where.campaignId }
    );

    if (!settings) {
      throw new Error('Campaign settings not found');
    }

    const jobGroup = await getJobIds(jobId);

    const jobGroups = [
      {
        key: 'ff',
        stageIndex: [
          settings.ffFirstBadgeStageIndex || -1,
          settings.ffSecondBadgeStageIndex || -1,
        ],
        jobIds: jobGroup.ff,
      },
      {
        key: 'fsm',
        stageIndex: [
          settings.fsmFirstBadgeStageIndex || -1,
          settings.ffSecondBadgeStageIndex || -1,
        ],
        jobIds: jobGroup.fsm,
      },
    ];

    // 오늘과 6일 전 설정
    const today = new Date(Math.min(new Date().getTime(), period.to.getTime()));
    const beforeWeek = new Date(
      Math.max(
        addDays(today, -6).getTime(), // today에서 6일 전
        new Date(period.from).getTime() // period.from
      )
    );

    const userBadges = await Promise.all(
      jobGroups.map(({ stageIndex, jobIds }) =>
        prisma.userQuizBadgeStageStatistics.groupBy({
          by: ['userId', 'elapsedSeconds', 'createdAt'], // quizStageId와 createdAt으로 그룹화
          where: {
            ...where,
            createdAt: {
              gte: startOfDay(beforeWeek), // 6일 전부터
              lte: endOfDay(today), // 오늘까지
            },
            quizStageIndex: { in: stageIndex },
            jobId: { in: jobIds },
            ...(storeId
              ? storeId === '4'
                ? { storeId }
                : { OR: [{ storeId }, { storeId: null }] }
              : {}),
          },
          orderBy: { createdAt: 'asc' }, // 날짜 순 정렬
        })
      )
    );

    let experts = removeDuplicateUsers(userBadges.flat());
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
          (entry: any) => entry.date === dateKey.replace(/-/g, '.')
        ); // 날짜 일치 항목 찾기

        if (match) {
          const time = item?.elapsedSeconds || 0;
          match.time += time;
        }
        return acc;
      }, initialData)
      .map((r: any) => {
        return { ...r, time: Math.round(r.time / 360) };
      });

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { result: [], message: 'Internal server error' },
      { status: 500 }
    );
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
