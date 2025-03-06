/* eslint-disable @typescript-eslint/no-explicit-any */

import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { querySearchParams } from '../../../_lib/query';
import { buildWhereWithValidKeys } from '../../../_lib/where';
import { UserQuizBadgeStageStatistics } from '@prisma/client';
import { initialExpertsData, removeDuplicateUsers } from '@/lib/data';

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
      quizStageIndex: 2,
      jobId: { in: jobGroup.map((job) => job.id) },
      ...moreWhere,
    },
  });
}

async function processUserStatistics(
  users: UserQuizBadgeStageStatistics[],
  jobGroup: { id: string; code: string }[],
  expertsData: any
) {
  // quizStageIndex기준 낮은 index일 때 중복되는 userId를 가진 아이템 제거
  removeDuplicateUsers(users).forEach((user) => {
    const jobName = jobGroup.find((j) => j.id === user.jobId)?.code;
    if (jobName) {
      expertsData.items.forEach((item: { title: string; value: number }) => {
        if (item.title === jobName) {
          item.value++;
        }
      });
    }
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where: condition } = querySearchParams(searchParams);
    const { jobId, ...where } = condition;

    await prisma.$connect();

    const expertsData: ImprovedDataStructure = JSON.parse(
      JSON.stringify(initialExpertsData)
    );

    const jobGroup = await prisma.job.findMany({
      where: jobId ? { code: jobId } : {},
      select: { id: true, code: true },
    });

    const plusUsers = await fetchUserStatistics(where, jobGroup, {
      OR: [{ storeId: { not: '4' } }, { storeId: null }],
    });
    processUserStatistics(plusUsers, jobGroup, expertsData[0]);
    //
    const sesUsers = await fetchUserStatistics(where, jobGroup, {
      storeId: '4',
    });
    processUserStatistics(sesUsers, jobGroup, expertsData[1]);

    return NextResponse.json({ result: expertsData });
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
