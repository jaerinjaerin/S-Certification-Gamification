/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = 'force-dynamic';

import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { querySearchParams } from '../../../_lib/query';
import { buildWhereWithValidKeys } from '../../../_lib/where';
import { UserQuizBadgeStageStatistics } from '@prisma/client';
import { removeDuplicateUsers } from '@/lib/data';

async function fetchUserStatistics(
  where: any,
  jobGroup: { id: string; code: string }[],
  moreWhere: any
) {
  return prisma.userQuizBadgeStageStatistics.findMany({
    where: {
      ...buildWhereWithValidKeys(where, [
        'campaignId',
        'regionId',
        'subsidiaryId',
        'domainId',
        'authType',
        'channelSegmentId',
        'createdAt',
      ]),
      quizStageIndex: { in: [2, 3] },
      jobId: { in: jobGroup.map((job) => job.id) },
      ...moreWhere,
    },
  });
}

async function processUserData(
  users: UserQuizBadgeStageStatistics[],
  jobGroup: { id: string; code: string }[],
  jobData: any,
  isSES: boolean = false
) {
  // quizStageIndex기준 낮은 index일 때 중복되는 userId를 가진 아이템 제거
  removeDuplicateUsers(users).forEach((user) => {
    const jobNameBase = jobGroup.find((j) => j.id === user.jobId)?.code;
    if (!jobNameBase) return;

    const jobName = isSES ? `${jobNameBase} (SES)` : jobNameBase;

    jobData.forEach(
      (item: { name: string; expert: number; advanced: number }) => {
        if (item.name === jobName.toUpperCase()) {
          if (user.quizStageIndex === 3) {
            item.advanced += 1;
          } else if (user.quizStageIndex === 2) {
            item.expert += 1;
          }
        }
      }
    );
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where: condition } = querySearchParams(searchParams);
    const { jobId, ...where } = condition;

    await prisma.$connect();

    // bar chart
    const jobData = [
      { name: 'FSM', expert: 0, advanced: 0 },
      { name: 'FF', expert: 0, advanced: 0 },
      { name: 'FSM (SES)', expert: 0, advanced: 0 },
      { name: 'FF (SES)', expert: 0, advanced: 0 },
    ];
    const jobGroup = await prisma.job.findMany({
      where: jobId ? { code: jobId } : {},
      select: { id: true, code: true },
    });

    const plusUsers = await fetchUserStatistics(where, jobGroup, {
      OR: [{ storeId: { not: '4' } }, { storeId: null }],
    });
    processUserData(plusUsers, jobGroup, jobData);

    const sesUsers = await fetchUserStatistics(where, jobGroup, {
      storeId: '4',
    });
    processUserData(sesUsers, jobGroup, jobData, true);

    // pie chart
    const pie = [
      {
        name: 'expert',
        value: jobData.reduce((acc, item) => acc + item.expert, 0),
      },
      {
        name: 'advanced',
        value: jobData.reduce((acc, item) => acc + item.advanced, 0),
      },
    ];

    const count = pie.reduce((acc, item) => acc + item.value, 0);

    return NextResponse.json({ result: { pie, bar: jobData }, count });
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
