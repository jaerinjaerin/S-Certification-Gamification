/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = 'force-dynamic';
import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { querySearchParams } from '../../../_lib/query';
import { buildWhereWithValidKeys } from '../../../_lib/where';
import { removeDuplicateUsers } from '@/lib/data';

// UserQuizStatistics, DomainGoal사용
// DomainGoal - ff,fsm,ffses,fsmses의 합이 국가별 총 목표수

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

    let userQuizeBadges = await prisma.userQuizBadgeStageStatistics.findMany({
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
      select: { userId: true, regionId: true, domainId: true },
    });

    // userId 중복 제거
    userQuizeBadges = removeDuplicateUsers(userQuizeBadges);

    const domains = await prisma.domain.findMany();

    const domain_goal = await prisma.domainGoal.findMany({
      where: {
        ...buildWhereWithValidKeys(where, [
          'campaignId',
          'regionId',
          'subsidiaryId',
          'domainId',
          'createdAt',
        ]),
      },
      orderBy: { updatedAt: 'desc' },
    });
    //
    const result = domain_goal
      .map(({ domainId, ff, ffSes, fsm, fsmSes }) => {
        const currentDomain = domains.find((domain) => domain.id === domainId);
        if (!currentDomain) return null;

        const expert = userQuizeBadges.reduce((acc, user) => {
          return acc + (user.domainId === domainId ? 1 : 0);
        }, 0);

        const goal = (ff || 0) + (fsm || 0) + (ffSes || 0) + (fsmSes || 0);

        return {
          name: currentDomain?.name,
          goal,
          expert,
        };
      })
      .filter((item) => item);

    return NextResponse.json({ result });
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
