import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { querySearchParams } from '@/lib/query';
import { buildWhereWithValidKeys } from '@/lib/where';
import { domainCheckOnly, getJobIds, removeDuplicateUsers } from '@/lib/data';

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
        stageIndex: settings.ffFirstBadgeStageIndex || -1,
        jobIds: jobGroup.ff,
      },
      {
        key: 'fsm',
        stageIndex: settings.fsmFirstBadgeStageIndex || -1,
        jobIds: jobGroup.fsm,
      },
    ];

    const userBadges = await Promise.all(
      jobGroups.map(({ stageIndex, jobIds }) =>
        prisma.userQuizBadgeStageStatistics.findMany({
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
          select: {
            userId: true,
            regionId: true,
            subsidiaryId: true,
            domainId: true,
          },
        })
      )
    );

    // userId 중복 제거
    const users = removeDuplicateUsers(userBadges.flat());

    // domainId만 확인해서 필터링 생성
    const whereForGoal = await domainCheckOnly(where);
    const domain_goal = await prisma.domainGoal.findMany({
      where: whereForGoal,
      orderBy: { updatedAt: 'desc' },
    });

    const domains = await prisma.domain.findMany({
      where: { id: whereForGoal.domainId },
      include: {
        subsidiary: {
          include: {
            region: { select: { id: true, name: true, order: true } },
          },
        },
      },
    });

    //
    let result = domain_goal
      .map(({ domainId, ff, ffSes, fsm, fsmSes }) => {
        const currentDomain = domains.find((domain) => domain.id === domainId);
        if (!currentDomain) return null;

        const expert = users.reduce((acc, user) => {
          return acc + (user.domainId === domainId ? 1 : 0);
        }, 0);

        const goal = (ff || 0) + (fsm || 0) + (ffSes || 0) + (fsmSes || 0);

        if (!where.regionId && !where.subsidiaryId && !where.domainId) {
          return {
            name: currentDomain.name,
            domainId: currentDomain.id,
            region: currentDomain.subsidiary?.region,
            order: currentDomain.order || 0,
            goal,
            expert,
          };
        }

        return {
          name: currentDomain.name,
          order: currentDomain.order || 0,
          goal,
          expert,
        };
      })
      .filter((item) => item)
      .sort((a: any, b: any) => a.order - b.order);

    if (!where.regionId && !where.subsidiaryId && !where.domainId) {
      const extract = result.reduce(
        (acc, item) => {
          if (!item?.region) return acc;

          const existingEntry = acc[item.region.id];

          if (!existingEntry) {
            acc[item.region.id] = {
              name: item.region.name || '',
              goal: item.goal,
              expert: item.expert,
              order: item.region.order || 0,
            };
          } else {
            existingEntry.goal += item.goal;
            existingEntry.expert += item.expert;
          }

          return acc;
        },
        {} as Record<
          string,
          { name: string; goal: number; expert: number; order: number }
        >
      );

      result = Object.values(extract).sort((a, b) => a.order - b.order) as any;
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { result: [], message: 'Internal server error' },
      { status: 500 }
    );
  }
}
