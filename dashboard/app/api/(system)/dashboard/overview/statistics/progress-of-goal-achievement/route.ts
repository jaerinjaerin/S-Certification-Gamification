/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { addWeeks, endOfWeek, isBefore, startOfWeek } from 'date-fns';
import { querySearchParams } from '@/lib/query';
import { buildWhereWithValidKeys } from '@/lib/where';
import { domainCheckOnly, getJobIds, removeDuplicateUsers } from '@/lib/data';
import {
  CampaignSettings,
  DomainGoal,
  UserQuizBadgeStageStatistics,
} from '@prisma/client';
import { queryRawWithWhere } from '@/lib/sql';

export const dynamic = 'force-dynamic';

async function processUserQuizBadgeStageStatistics(
  weeklyWhere: any,
  moreWhere: any,
  jobName: string,
  stageIndex: number,
  jobGroup: string[],
  jobData: any,
  isSES: boolean = false
) {
  const users = await queryRawWithWhere(
    prisma,
    'UserQuizBadgeStageStatistics',
    {
      ...weeklyWhere,
      quizStageIndex: stageIndex,
      jobId: { in: jobGroup },
      ...moreWhere,
    }
  );

  // userId 중복 제거
  removeDuplicateUsers(users as UserQuizBadgeStageStatistics[]).forEach(
    (user) => {
      const lowJobName = isSES
        ? `${jobName.toLowerCase()}(ses)`
        : jobName.toLowerCase();

      if (lowJobName in jobData) {
        jobData[lowJobName] += 1;
      }
    }
  );
}

const weeklyGoalRate = [10, 30, 50, 60, 70, 80, 90, 100];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where: condition } = querySearchParams(searchParams);
    const { jobId, ...where } = condition;

    // 캠페인 데이터 가져오기
    const [campaign]: Campaign[] = await queryRawWithWhere(prisma, 'Campaign', {
      id: where.campaignId,
    });

    if (!campaign?.startedAt || !campaign?.endedAt) {
      throw new Error('Invalid campaign date range');
    }

    const [settings]: CampaignSettings[] = await queryRawWithWhere(
      prisma,
      'CampaignSettings',
      {
        campaignId: where.campaignId,
      }
    );

    if (!settings) {
      throw new Error('Campaign settings not found');
    }

    const jobGroup = await getJobIds(jobId);

    // userId가 중복되는 데이터가 있어서 그룹으로 데이터 가져옴
    const jobGroups = [
      {
        key: 'ff',
        stageIndex: settings.ffFirstBadgeStageIndex || -1,
        jobIds: jobGroup.ff,
      },
      {
        key: 'fsm',
        stageIndex: settings.fsmFirstBadgeStageIndex || -1,
        jobIds: jobGroup.fsm,
      },
    ];

    // domainId만 확인해서 필터링 생성성
    const { createdAt, ...whereForGoal } = await domainCheckOnly(where);
    const domain_goal = await queryRawWithWhere(
      prisma,
      'DomainGoal',
      whereForGoal
    );

    const goalTotalScore = Array.isArray(domain_goal)
      ? (domain_goal as DomainGoal[]).reduce(
          (sum, { ff = 0, ffSes = 0, fsm = 0, fsmSes = 0 }) =>
            sum + ff + fsm + ffSes + fsmSes,
          0
        )
      : 0;

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
        await Promise.all(
          jobGroups.map(({ key, stageIndex, jobIds }) =>
            processUserQuizBadgeStageStatistics(
              weeklyWhere,
              { OR: [{ storeId: null }, { storeId: { not: '4' } }] },
              key,
              stageIndex,
              jobIds,
              jobData
            )
          )
        );

        // ses
        await Promise.all(
          jobGroups.map(({ key, stageIndex, jobIds }) =>
            processUserQuizBadgeStageStatistics(
              weeklyWhere,
              { storeId: '4' },
              key,
              stageIndex,
              jobIds,
              jobData,
              true
            )
          )
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
      cumulativeRate =
        expertTotal > 0 ? (expertTotal / goalTotalScore) * 100 : 0;
    }

    return NextResponse.json({
      result: { jobData: weeklyJobData, goalTotalScore, cumulativeRate },
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      {
        result: { jobData: [], goalTotalScore: 0, cumulativeRate: 0 },
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
