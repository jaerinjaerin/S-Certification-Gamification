/* eslint-disable @typescript-eslint/no-explicit-any */

import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { querySearchParams } from '@/lib/query';
import { buildWhereWithValidKeys } from '@/lib/where';
import { UserQuizBadgeStageStatistics } from '@prisma/client';
import {
  getJobIds,
  initialExpertsData,
  removeDuplicateUsers,
} from '@/lib/data';

export const dynamic = 'force-dynamic';

async function fetchUserStatistics(
  where: any,
  stageIndex: number,
  jobGroup: string[],
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
      quizStageIndex: stageIndex,
      jobId: { in: jobGroup },
      ...moreWhere,
    },
  });
}

async function processUserStatistics(
  users: UserQuizBadgeStageStatistics[],
  jobGroup: Record<string, string[]>,
  expertsData: any
) {
  // quizStageIndex기준 낮은 index일 때 중복되는 userId를 가진 아이템 제거
  removeDuplicateUsers(users).forEach((user) => {
    const jobName =
      (Object.keys(jobGroup) as Array<keyof typeof jobGroup>).find((key) =>
        jobGroup[key].includes(user.jobId)
      ) || null;
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

    const settings = await prisma.campaignSettings.findFirst({
      where: { campaignId: where.campaignId },
    });

    if (!settings) {
      throw new Error('Campaign settings not found');
    }

    const expertsData: ImprovedDataStructure = JSON.parse(
      JSON.stringify(initialExpertsData)
    );

    const jobGroup = await getJobIds(jobId);

    const jobGroups = [
      {
        key: 'ff',
        stageIndex: settings.ffFirstBadgeStageIndex! || -1,
        jobIds: jobGroup.ff,
      },
      {
        key: 'fsm',
        stageIndex: settings.fsmFirstBadgeStageIndex! || -1,
        jobIds: jobGroup.fsm,
      },
    ];

    const plusUsers = await Promise.all(
      jobGroups.map(({ stageIndex, jobIds }) =>
        fetchUserStatistics(where, stageIndex, jobIds, {
          OR: [{ storeId: { not: '4' } }, { storeId: null }],
        })
      )
    );

    plusUsers.forEach((plusUser, index) => {
      processUserStatistics(plusUser, jobGroup, expertsData[0]);
    });
    //
    const sesUsers = await Promise.all(
      jobGroups.map(({ stageIndex, jobIds }) =>
        fetchUserStatistics(where, stageIndex, jobIds, {
          storeId: '4',
        })
      )
    );

    sesUsers.forEach((sesUser, index) => {
      processUserStatistics(sesUser, jobGroup, expertsData[1]);
    });

    return NextResponse.json({ result: expertsData });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      {
        result: [
          {
            group: 'plus',
            items: [
              { title: 'ff', value: 0 },
              { title: 'fsm', value: 0 },
            ],
          },
          {
            group: 'ses',
            items: [
              { title: 'ff', value: 0 },
              { title: 'fsm', value: 0 },
            ],
          },
        ],
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
