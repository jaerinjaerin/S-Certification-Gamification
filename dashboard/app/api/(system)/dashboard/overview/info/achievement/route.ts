/* eslint-disable @typescript-eslint/no-explicit-any */

import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { querySearchParams } from '@/lib/query';
import { buildWhereWithValidKeys } from '@/lib/where';
import { domainCheckOnly, getJobIds } from '@/lib/data';
import { CampaignSettings, DomainGoal } from '@prisma/client';
import { queryRawWithWhere } from '@/lib/sql';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where: condition } = querySearchParams(searchParams);
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

    const users = await Promise.all(
      jobGroups.map(({ stageIndex, jobIds }) =>
        prisma.userQuizBadgeStageStatistics.groupBy({
          by: ['userId'],
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
            jobId: { in: jobIds },
            ...(storeId
              ? storeId === '4'
                ? { storeId }
                : { OR: [{ storeId }, { storeId: null }] }
              : {}),
          },
          _count: { userId: true },
        })
      )
    );

    const expertCount = users.reduce((total, group) => total + group.length, 0);

    // domainId만 확인해서 필터링 생성
    const { createdAt, ...whereForGoal } = await domainCheckOnly(where);
    const domain_goal: DomainGoal[] = await queryRawWithWhere(
      prisma,
      'DomainGoal',
      whereForGoal
    );
    //
    const total = domain_goal.reduce((sum, item) => {
      return (
        sum +
        (item.ff || 0) +
        (item.fsm || 0) +
        (item.ffSes || 0) +
        (item.fsmSes || 0)
      );
    }, 0);

    const count = total > 0 ? (expertCount / total) * 100 : 0;

    return NextResponse.json({ result: { count } });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { result: { count: 0 }, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
