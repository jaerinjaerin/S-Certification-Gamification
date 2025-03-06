'use server';
import { prisma } from '@/model/prisma';
import { domainCheckOnly, removeDuplicateUsers } from '@/lib/data';
import { querySearchParams } from '@/app/api/(system)/dashboard/_lib/query';
import { buildWhereWithValidKeys } from '@/app/api/(system)/dashboard/_lib/where';
import { addWeeks, endOfWeek, isBefore, startOfWeek } from 'date-fns';
import { URLSearchParams } from 'url';

export async function getAchievementRate(data: URLSearchParams) {
  try {
    const { where: condition } = querySearchParams(data) as any;
    const { jobId, storeId, ...where } = condition;

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

    return total > 0 ? (expertCount / total) * 100 : 0;
  } catch (error) {
    console.error('Error fetching data:', error);
    return 0;
  }
}

export async function getAchievementProgress(data: URLSearchParams) {
  try {
    const { where: condition } = querySearchParams(data);
    const { jobId, storeId, ...where } = condition;

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
      select: {
        userId: true,
        regionId: true,
        subsidiaryId: true,
        domainId: true,
      },
    });

    // userId 중복 제거
    userQuizeBadges = removeDuplicateUsers(userQuizeBadges);

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

        const expert = userQuizeBadges.reduce((acc, user) => {
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
    return result;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

export async function getAchievementGoalProgress(data: URLSearchParams) {
  const weeklyGoalRate = [10, 30, 50, 60, 70, 80, 90, 100];

  async function processUserQuizBadgeStageStatistics(
    weeklyWhere: any,
    moreWhere: any,
    jobData: any,
    jobGroup: any[],
    isSES: boolean = false
  ) {
    const users = await prisma.userQuizBadgeStageStatistics.findMany({
      where: {
        ...weeklyWhere,
        quizStageIndex: 2,
        jobId: { in: jobGroup.map((job) => job.id) },
        ...moreWhere,
      },
    });

    // userId 중복 제거
    removeDuplicateUsers(users).forEach((user) => {
      const jobName = jobGroup.find((j) => j.id === user.jobId)?.code;
      if (jobName) {
        const lowJobName = isSES
          ? (`${jobName.toLowerCase()}(ses)` as keyof typeof jobData)
          : (jobName.toLowerCase() as keyof typeof jobData);

        if (lowJobName in jobData) {
          jobData[lowJobName] += 1;
        }
      }
    });
  }

  try {
    const { where: condition } = querySearchParams(data);
    const { jobId, ...where } = condition;

    // 캠페인 데이터 가져오기
    const campaign = await prisma.campaign.findUnique({
      where: { id: where.campaignId },
    });

    if (!campaign?.startedAt || !campaign?.endedAt) {
      throw new Error('Invalid campaign date range');
    }

    // domainId만 확인해서 필터링 생성성
    const whereForGoal = await domainCheckOnly(where);
    const domain_goal = await prisma.domainGoal.findMany({
      where: whereForGoal,
      orderBy: { updatedAt: 'desc' },
    });

    const goalTotalScore = Array.isArray(domain_goal)
      ? domain_goal.reduce(
          (sum, { ff = 0, ffSes = 0, fsm = 0, fsmSes = 0 }) =>
            sum + ff + fsm + ffSes + fsmSes,
          0
        )
      : 0;

    const today = new Date();
    const startDate = startOfWeek(campaign.startedAt); // 캠페인 시작 주
    let weekIndex = 0;
    const weeklyJobData = [];
    const defaultJobData = {
      ff: 0,
      fsm: 0,
      'ff(ses)': 0,
      'fsm(ses)': 0,
    };

    const jobGroup = await prisma.job.findMany({
      where: jobId ? { code: jobId } : {},
      select: { id: true, code: true },
    });

    // 8주 데이터 생성
    for (let i = 0; i < 8; i++) {
      const jobData = JSON.parse(JSON.stringify(defaultJobData));
      const currentWeekStart = addWeeks(startDate, i);
      const weekEnd = endOfWeek(currentWeekStart);

      // 캠페인 기간 내에만 데이터를 계산
      const isCurrentWeekValid = isBefore(currentWeekStart, today);
      const isWithinCampaign = currentWeekStart <= campaign.endedAt;

      if (isCurrentWeekValid && isWithinCampaign) {
        const weeklyWhere = {
          ...buildWhereWithValidKeys(where, [
            'campaignId',
            'regionId',
            'subsidiaryId',
            'domainId',
            'authType',
            'channelSegmentId',
          ]),
          createdAt: {
            gte: startDate,
            lt: weekEnd,
          },
        };

        // plus
        await processUserQuizBadgeStageStatistics(
          weeklyWhere,
          { OR: [{ storeId: null }, { storeId: { not: '4' } }] },
          jobData,
          jobGroup
        );

        // ses
        await processUserQuizBadgeStageStatistics(
          weeklyWhere,
          { storeId: '4' },
          jobData,
          jobGroup,
          true
        );
      }

      // 결과 저장
      weeklyJobData.push({
        date: `${currentWeekStart.toISOString()} - ${weekEnd.toISOString()}`,
        name: `W${weekIndex + 1}`,
        job: JSON.parse(JSON.stringify(jobData)),
        total: Object.values(jobData).reduce(
          (sum, value) => (sum as number) + (value as number),
          0
        ),
        target: weeklyGoalRate[weekIndex] || 0,
      });

      weekIndex++;
    }

    //
    const foundJobElement = weeklyJobData.findLast(
      ({ job }: { job: Record<string, number> }) =>
        Object.values(job).reduce((sum, value) => sum + value, 0) > 0
    );

    let cumulativeRate = 0;
    if (foundJobElement) {
      const expertTotal = Object.values(
        foundJobElement.job as Record<string, number>
      ).reduce((sum, value) => sum + value, 0);
      cumulativeRate =
        expertTotal > 0 ? (expertTotal / goalTotalScore) * 100 : 0;
    }

    return { jobData: weeklyJobData, goalTotalScore, cumulativeRate };
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}
