/* eslint-disable @typescript-eslint/no-explicit-any */

import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { querySearchParams } from '@/lib/query';
import { domainCheckOnly, getJobIds } from '@/lib/data';
import { AuthType } from '@prisma/client';
import { buildWhereWithValidKeys } from '@/lib/where';

// UserQuizStatistics, DomainGoal사용
// DomainGoal - ff,fsm,ffses,fsmses의 합이 국가별 총 목표수

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where: condition, take, skip } = querySearchParams(searchParams);
    const { jobId, storeId, ...where } = condition;

    const settings = await prisma.campaignSettings.findFirst({
      where: { campaignId: where.campaignId },
    });

    if (!settings) {
      throw new Error('Campaign settings not found');
    }

    const jobGroup = await getJobIds(jobId);

    const jobGroups = [
      {
        key: 'ff',
        stageIndex: [
          settings.ffFirstBadgeStageIndex || -1,
          settings.ffSecondBadgeStageIndex || -1,
        ],
        jobIds: jobGroup.ff,
      },
      {
        key: 'fsm',
        stageIndex: [
          settings.fsmFirstBadgeStageIndex || -1,
          settings.ffSecondBadgeStageIndex || -1,
        ],
        jobIds: jobGroup.fsm,
      },
    ];

    // domainId만 확인해서 필터링 생성
    const whereForGoal = (await domainCheckOnly(where)) as any;
    const count = await prisma.domainGoal.count({
      where: whereForGoal,
    });

    const domainsGoals = await prisma.domainGoal.findMany({
      where: whereForGoal,
    });

    const domains = await prisma.domain.findMany({
      where: {
        id: {
          in: domainsGoals
            .map((goal) => goal.domainId)
            .filter((id): id is string => id !== null),
        },
      },
      include: { subsidiary: { include: { region: true } } },
      orderBy: { order: 'asc' },
      take,
      skip,
    });

    const userBadges = await Promise.all(
      jobGroups.map(({ stageIndex, jobIds }) =>
        prisma.userQuizBadgeStageStatistics.groupBy({
          by: ['domainId', 'authType', 'quizStageIndex', 'jobId', 'storeId'],
          where: {
            ...buildWhereWithValidKeys(where, [
              'campaignId',
              'authType',
              'channelSegmentId',
              'createdAt',
            ]),
            domainId: { in: domains.map((domain) => domain.id) },
            quizStageIndex: { in: stageIndex },
            jobId: { in: jobIds },
            ...(storeId
              ? storeId === '4'
                ? { storeId }
                : { OR: [{ storeId }, { storeId: null }] }
              : {}),
          },
          _count: { quizStageIndex: true },
        })
      )
    );

    const experts = userBadges.flat();

    const expertData = domains.reduce(
      (acc: any, domain: any) => {
        const expert = experts.find((expert) => expert.domainId === domain.id);
        if (!expert) {
          acc[domain.id] = {
            goal: 0,
            plusExpert: 0,
            plusAdvanced: 0,
            noneExpert: 0,
            noneAdvanced: 0,
            ffExpert: 0,
            ffAdvanced: 0,
            fsmExpert: 0,
            fsmAdvanced: 0,
            ffSesExpert: 0,
            ffSesAdvanced: 0,
            fsmSesExpert: 0,
            fsmSesAdvanced: 0,
          };
          return acc;
        }

        const {
          _count,
          domainId,
          authType: auth,
          quizStageIndex,
          jobId,
          storeId,
        } = expert;

        //
        if (!domainId) return acc;

        //
        const authType = auth === AuthType.SUMTOTAL ? 'plus' : 'none';
        const expertType = quizStageIndex === 2 ? 'Expert' : 'Advanced';
        const storeType = storeId === '4' ? 'Ses' : '';
        const jobName =
          (Object.keys(jobGroup) as Array<keyof typeof jobGroup>).find((key) =>
            jobGroup[key].includes(jobId || '')
          ) || null;

        //goal
        const { ff, fsm, ffSes, fsmSes } = domainsGoals.find(
          (goal) => goal.domainId === domainId
        ) || { ff: 0, fsm: 0, ffSes: 0, fsmSes: 0 };
        const goal = ff + fsm + ffSes + fsmSes;
        //

        if (!acc[domainId]) {
          acc[domainId] = {
            goal: 0,
            plusExpert: 0,
            plusAdvanced: 0,
            noneExpert: 0,
            noneAdvanced: 0,
            ffExpert: 0,
            ffAdvanced: 0,
            fsmExpert: 0,
            fsmAdvanced: 0,
            ffSesExpert: 0,
            ffSesAdvanced: 0,
            fsmSesExpert: 0,
            fsmSesAdvanced: 0,
          };
        }

        const entry = acc[domainId];
        entry.goal += goal;
        entry[`${authType}${expertType}`] += _count.quizStageIndex;
        entry[`${jobName}${storeType}${expertType}`] += _count.quizStageIndex;

        return acc;
      },
      {} as Record<string, any>
    );

    const result = Object.entries(expertData)
      .map(([domainId, value]: any) => {
        const domain = domains.find((domain) => domain.id === domainId);
        if (!domain) return;

        const expertTotal = value.plusExpert + value.noneExpert;
        const advancedTotal = value.plusAdvanced + value.noneAdvanced;
        const achievement =
          value.goal > 0 ? (expertTotal / value.goal) * 100 : 0;

        return {
          order: domain.order,
          domain: { id: domain.id, name: domain.name },
          subsidiary: domain.subsidiary
            ? { id: domain.subsidiary.id, name: domain.subsidiary.name }
            : null,
          region: domain.subsidiary?.region
            ? {
                id: domain.subsidiary.region.id,
                name: domain.subsidiary.region.name,
              }
            : null,
          goal: value.goal,
          expert: `${expertTotal}(${advancedTotal})`,
          achievement,
          expertDetail: {
            date: domain.updatedAt,
            country: domain.name,
            plus: `${value.plusExpert} (${value.plusAdvanced})`,
            none: `${value.noneExpert} (${value.noneAdvanced})`,
            ff: `${value.ffExpert} (${value.ffAdvanced})`,
            fsm: `${value.fsmExpert} (${value.fsmAdvanced})`,
            'ff(ses)': `${value.ffSesExpert} (${value.ffSesAdvanced})`,
            'fsm(ses)': `${value.fsmSesExpert} (${value.fsmSesAdvanced})`,
          },
        };
      })
      .sort((a, b) => (a?.order || 0) - (b?.order || 0));

    return NextResponse.json({ result: { data: result, total: count } });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { result: { data: [], total: 0 }, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
