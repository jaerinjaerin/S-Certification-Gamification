export const dynamic = 'force-dynamic';
import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { querySearchParams } from '../../../_lib/query';
import { buildWhereWithValidKeys } from '../../../_lib/where';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where: condition } = querySearchParams(searchParams);
    const { jobId, storeId, ...where } = condition;

    await prisma.$connect();

    const jobGroup = await prisma.job.findMany({
      where: jobId ? { code: jobId } : {},
      select: { id: true, code: true },
    });

    // userId가 중복되는 데이터가 있어서 그룹으로 데이터 가져옴
    const userGroupByUserId = await prisma.userQuizBadgeStageStatistics.groupBy(
      {
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
          quizStageIndex: 2,
          jobId: { in: jobGroup.map((job) => job.id) },
          ...(storeId
            ? storeId === '4'
              ? { storeId }
              : { OR: [{ storeId }, { storeId: null }] }
            : {}),
        },
        _count: { userId: true },
      }
    );

    const expertCount = userGroupByUserId.length;

    const domain_goal = await prisma.domainGoal.findMany({
      where: {
        ...buildWhereWithValidKeys(where, [
          'campaignId',
          'regionId',
          'subidiaryId',
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
