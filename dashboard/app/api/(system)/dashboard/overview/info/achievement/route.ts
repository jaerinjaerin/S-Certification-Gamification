/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = 'force-dynamic';
import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { querySearchParams } from '../../../_lib/query';
import { buildWhereWithValidKeys } from '../../../_lib/where';
import { domainCheckOnly } from '@/lib/data';

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

    // domainId만 확인해서 필터링 생성성
    const whereForGoal = await domainCheckOnly(where);
    const domain_goal = await prisma.domainGoal.findMany({
      where: whereForGoal,
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

    const count = total > 0 ? (expertCount / total) * 100 : 0;

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
