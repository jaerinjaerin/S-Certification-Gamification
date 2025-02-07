/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = 'force-dynamic';

import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { addWeeks, endOfWeek, isBefore, startOfWeek } from 'date-fns';
import { querySearchParams } from '../../../_lib/query';
import { buildWhereWithValidKeys } from '../../../_lib/where';
import { domainCheckOnly, removeDuplicateUsers } from '@/lib/data';

async function processUserQuizBadgeStageStatistics(
  weeklyWhere: any,
  moreWhere: any,
  jobData: any,
  jobGroup: any[],
  isSES: boolean = false
) {
  const users = await prisma.userQuizBadgeStageStatistics.findMany({
    where: {
      ...weeklyWhere,
      quizStageIndex: 2,
      jobId: { in: jobGroup.map((job) => job.id) },
      ...moreWhere,
    },
  });

  // userId 중복 제거
  removeDuplicateUsers(users).forEach((user) => {
    const jobName = jobGroup.find((j) => j.id === user.jobId)?.code;
    if (jobName) {
      const lowJobName = isSES
        ? (`${jobName.toLowerCase()}(ses)` as keyof typeof jobData)
        : (jobName.toLowerCase() as keyof typeof jobData);

      if (lowJobName in jobData) {
        jobData[lowJobName] += 1;
      }
    }
  });
}

const weeklyGoalRate = [10, 30, 50, 60, 70, 80, 90, 100];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where: condition } = querySearchParams(searchParams);
    const { jobId, ...where } = condition;

    await prisma.$connect();

    // 캠페인 데이터 가져오기
    const campaign = await prisma.campaign.findUnique({
      where: { id: where.campaignId },
    });

    if (!campaign?.startedAt || !campaign?.endedAt) {
      return NextResponse.json(
        { error: 'Invalid campaign date range' },
        { status: 400 }
      );
    }

    // domainId만 확인해서 필터링 생성성
    const whereForGoal = await domainCheckOnly(where);
    const domain_goal = await prisma.domainGoal.findMany({
      where: whereForGoal,
      orderBy: { updatedAt: 'desc' },
    });

    const goalTotalScore = Array.isArray(domain_goal)
      ? domain_goal.reduce(
          (sum, { ff = 0, ffSes = 0, fsm = 0, fsmSes = 0 }) =>
            sum + ff + fsm + ffSes + fsmSes,
          0
        )
      : 0;
    console.log('🚀 ~ GET ~ goalTotalScore:', goalTotalScore);

    const today = new Date();
    const startDate = startOfWeek(campaign.startedAt); // 캠페인 시작 주
    let weekIndex = 0;
    const weeklyJobData = [];
    const defaultJobData = {
      ff: 0,
      fsm: 0,
      'ff(ses)': 0,
      'fsm(ses)': 0,
    };

    const jobGroup = await prisma.job.findMany({
      where: jobId ? { code: jobId } : {},
      select: { id: true, code: true },
    });

    // 8주 데이터 생성
    for (let i = 0; i < 8; i++) {
      const jobData = JSON.parse(JSON.stringify(defaultJobData));
      const currentWeekStart = addWeeks(startDate, i);
      const weekEnd = endOfWeek(currentWeekStart);

      // 캠페인 기간 내에만 데이터를 계산
      const isCurrentWeekValid = isBefore(currentWeekStart, today);
      const isWithinCampaign = currentWeekStart <= campaign.endedAt;

      if (isCurrentWeekValid && isWithinCampaign) {
        const weeklyWhere = {
          ...buildWhereWithValidKeys(where, [
            'campaignId',
            'regionId',
            'subsidiaryId',
            'domainId',
            'authType',
            'channelSegmentId',
          ]),
          createdAt: {
            gte: startDate,
            lt: weekEnd,
          },
        };

        // plus
        await processUserQuizBadgeStageStatistics(
          weeklyWhere,
          { OR: [{ storeId: null }, { storeId: { not: '4' } }] },
          jobData,
          jobGroup
        );

        // ses
        await processUserQuizBadgeStageStatistics(
          weeklyWhere,
          { storeId: '4' },
          jobData,
          jobGroup,
          true
        );
      }

      // 결과 저장
      weeklyJobData.push({
        date: `${currentWeekStart.toISOString()} - ${weekEnd.toISOString()}`,
        name: `W${weekIndex + 1}`,
        job: JSON.parse(JSON.stringify(jobData)),
        total: Object.values(jobData).reduce(
          (sum, value) => (sum as number) + (value as number),
          0
        ),
        target: weeklyGoalRate[weekIndex] || 0,
      });

      weekIndex++;
    }

    //
    const foundJobElement = weeklyJobData.findLast(
      ({ job }: { job: Record<string, number> }) =>
        Object.values(job).reduce((sum, value) => sum + value, 0) > 0
    );

    let cumulativeRate = 0;
    if (foundJobElement) {
      const expertTotal = Object.values(
        foundJobElement.job as Record<string, number>
      ).reduce((sum, value) => sum + value, 0);
      console.log('🚀 ~ GET ~ expertTotal:', expertTotal);
      cumulativeRate =
        expertTotal > 0 ? (expertTotal / goalTotalScore) * 100 : 0;
    }

    return NextResponse.json({
      result: { jobData: weeklyJobData, goalTotalScore, cumulativeRate },
    });
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
