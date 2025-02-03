export const dynamic = 'force-dynamic';

import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { querySearchParams } from '../../../_lib/query';
import { buildWhereWithValidKeys } from '../../../_lib/where';

// UserQuizStatistics, DomainGoal사용
// DomainGoal - ff,fsm,ffses,fsmses의 합이 국가별 총 목표수

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where: condition } = querySearchParams(searchParams);
    const { jobId, ...where } = condition;
    console.log('🚀 ~ GET ~ where:', where);

    await prisma.$connect();

    const jobGroup = await prisma.job.findMany({
      where: jobId ? { group: jobId } : {},
      select: { id: true, group: true },
    });

    const expertCount = await prisma.userQuizBadgeStageStatistics.count({
      where: {
        ...buildWhereWithValidKeys(where, [
          'campaignId',
          'regionId',
          'subsidiaryId',
          'domainId',
          'authType',
          'channelSegmentId',
          'storeId',
          'createdAt',
        ]),
        quizStageIndex: 2,
        jobId: { in: jobGroup.map((job) => job.id) },
      },
    });

    const domain_goal = await prisma.domainGoal.findMany({
      where: {
        ...buildWhereWithValidKeys(where, [
          'campaignId',
          'domainId',
          'createdAt',
        ]),
      },
    });
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

    const count = (expertCount / total) * 100;

    return NextResponse.json({ result: { count } });
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
