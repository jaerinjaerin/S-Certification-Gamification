import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { querySearchParams } from '@/lib/query';
import { buildWhereWithValidKeys } from '@/lib/where';
import { getJobIds } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where: condition } = querySearchParams(searchParams);
    const { jobId, storeId, ...where } = condition;

    const settings = await prisma.campaignSettings.findFirst({
      where: { campaignId: where.campaignId },
    });

    if (!settings) {
      throw new Error('Campaign settings not found');
    }

    const jobGroup = await getJobIds(jobId);

    // userId가 중복되는 데이터가 있어서 그룹으로 데이터 가져옴
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

    const count = users.reduce((total, group) => total + group.length, 0);
    return NextResponse.json({ result: { count } });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { result: { count: 0 }, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
