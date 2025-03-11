import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { addDays, endOfDay, startOfDay } from 'date-fns';
import { querySearchParams } from '@/lib/query';
import { getJobIds, removeDuplicateUsers } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where: condition, period } = querySearchParams(searchParams);
    const { jobId, storeId, ...where } = condition;

    const settings = await prisma.campaignSettings.findFirst({
      where: { campaignId: where.campaignId },
    });

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
    const today = addDays(
      new Date(Math.min(new Date().getTime(), period.to.getTime())),
      1
    );
    const beforeWeek = new Date(addDays(period.from, 1).getTime());
    // const beforeWeek = new Date(
    //   Math.min(
    //     addDays(today, -5).getTime(), // today포함해서 6일 전
    //     addDays(period.from, 1).getTime() // period.from
    //   )
    // );

    const userBadges = await Promise.all(
      jobGroups.map(({ stageIndex, jobIds }) =>
        prisma.userQuizBadgeStageStatistics.findMany({
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

    // 중복 userId 제거
    const experts = removeDuplicateUsers(userBadges.flat());

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
      total: 0,
      expert: 0,
      advanced: 0,
    }));

    // 데이터 그룹화 및 합산
    const result = experts.reduce((acc, item) => {
      const dateKey = item.createdAt.toISOString().split('T')[0]; // 날짜 추출
      const match = acc.find(
        (entry: any) => entry.date === dateKey.replace(/-/g, '.')
      ); // 날짜 일치 항목 찾기
      if (match) {
        if (item.quizStageIndex === 2) {
          match.expert += 1; // stage_2는 expert
        } else if (item.quizStageIndex === 3) {
          match.advanced += 1; // stage_3은 advanced
        }
        match.total = match.expert + match.advanced; // total 계산
      }
      return acc;
    }, initialData);

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      {
        result: [],
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
