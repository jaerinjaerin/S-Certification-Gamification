export const dynamic = 'force-dynamic';

import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { querySearchParams } from '../../../_lib/query';
import { buildWhereWithValidKeys } from '../../../_lib/where';

// UserQuizStatistics 중 isCompleted 기 true 인 유저

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where: condition } = querySearchParams(searchParams);
    const { jobId, ...where } = condition;

    await prisma.$connect();

    const jobGroup = await prisma.job.findMany({
      where: jobId ? { group: jobId } : {},
      select: { id: true, group: true },
    });

    const count = await prisma.userQuizBadgeStageStatistics.count({
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
