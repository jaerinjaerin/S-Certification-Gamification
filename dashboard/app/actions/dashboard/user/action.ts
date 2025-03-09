'use server';
import { prisma } from '@/model/prisma';
import { querySearchParams } from '@/lib/query';
import { decrypt } from '@/utils/encrypt';
import { domainCheckOnly, getJobIds, removeDuplicateUsers } from '@/lib/data';
import { buildWhereWithValidKeys } from '@/lib/where';
import { AuthType } from '@prisma/client';
import { addDays, endOfDay, startOfDay } from 'date-fns';
import { URLSearchParams } from 'url';

export async function getUserProgress(
  data: URLSearchParams | Record<string, string>
) {
  try {
    const { where: condition, take, skip } = querySearchParams(data) as any;
    const { jobId, storeId, ...where } = condition;

    const jobGroup = await prisma.job.findMany({
      where: jobId ? { code: jobId } : {},
      select: { id: true, code: true },
    });

    const count = await prisma.userQuizLog.count({
      where: {
        ...where,
        jobId: { in: jobGroup.map((job) => job.id) },
        ...(storeId
          ? storeId === '4'
            ? { storeId }
            : { OR: [{ storeId }, { storeId: null }] }
          : {}),
      },
    });

    const logs = await prisma.userQuizLog.findMany({
      where: {
        ...where,
        jobId: { in: jobGroup.map((job) => job.id) },
        ...(storeId
          ? storeId === '4'
            ? { storeId }
            : { OR: [{ storeId }, { storeId: null }] }
          : {}),
      },

      select: { userId: true, lastCompletedStage: true },
      take,
      skip,
    });

    const users = await prisma.user.findMany({
      where: {
        id: { in: logs.map((log) => log.userId) },
      },
      select: { id: true, providerUserId: true },
    });

    const userMap = new Map(
      users.map((user) => {
        const employeeId = user.providerUserId
          ? decrypt(user.providerUserId, true)
          : null;
        return [user.id, employeeId];
      })
    );

    const result = logs.map((log) => ({
      providerUserId: userMap.get(log.userId) || null,
      lastCompletedStage: log.lastCompletedStage
        ? log.lastCompletedStage + 1
        : 0,
    }));

    return { result, total: count };
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

export async function getUserDomain(
  data: URLSearchParams | Record<string, any>
) {
  try {
    const { where: condition, take, skip } = querySearchParams(data);
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

    return { result, total: count };
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

export async function getUserAverageScore(
  data: URLSearchParams | Record<string, any>
) {
  function filterHighestScores(data: any) {
    // Create a Map to store the highest score for each userId
    const userMap = new Map();

    data.forEach((item: any) => {
      const existingItem = userMap.get(item.userId);
      if (!existingItem || item.score > existingItem.score) {
        // Update the map if the userId is not present or the current score is higher
        userMap.set(item.userId, item);
      }
    });

    // Return the values of the map as an array
    return Array.from(userMap.values());
  }

  try {
    const { where: condition, period } = querySearchParams(data);
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

    // 오늘과 6일 전 설정
    const today = new Date(Math.min(new Date().getTime(), period.to.getTime()));
    const beforeWeek = new Date(
      Math.max(
        addDays(today, -6).getTime(), // today에서 6일 전
        new Date(period.from).getTime() // period.from
      )
    );

    const userBadges = await Promise.all(
      jobGroups.map(({ stageIndex, jobIds }) =>
        prisma.userQuizBadgeStageStatistics.findMany({
          where: {
            ...where,
            createdAt: {
              gte: startOfDay(beforeWeek), // 6일 전부터
              lte: endOfDay(today), // 오늘까지
            },
            quizStageIndex: { in: stageIndex },
            jobId: { in: jobIds },
            ...(storeId
              ? storeId === '4'
                ? { storeId }
                : { OR: [{ storeId }, { storeId: null }] }
              : {}),
          },
          orderBy: { createdAt: 'asc' }, // 날짜 순 정렬
        })
      )
    );
    // 중복 userId 제거
    let experts = removeDuplicateUsers(userBadges.flat());
    experts = filterHighestScores(experts);
    //
    // 날짜 범위를 생성
    const getDateRange = (start: Date, end: Date) => {
      const dates = [];
      const current = new Date(start);
      while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
      return dates;
    };

    // 날짜별 초기 데이터 생성
    const initialData = getDateRange(beforeWeek, today).map((date) => ({
      date: date.replace(/-/g, '.'), // YYYY-MM-DD -> YYYY.MM.DD
      score: 0,
    }));

    // 데이터 그룹화 및 합산
    const result = experts.reduce((acc, item) => {
      const dateKey = item.createdAt.toISOString().split('T')[0]; // 날짜 추출
      const match = acc.find(
        (entry: any) => entry.date === dateKey.replace(/-/g, '.')
      ); // 날짜 일치 항목 찾기
      if (match) {
        const score = item.score / experts.length;
        match.score += score; // stage_2는 expert
      }
      return acc;
    }, initialData);

    return result;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

export async function getUserCompletionTime(
  data: URLSearchParams | Record<string, any>
) {
  function filterHighestElapsedSeconds(data: any) {
    // Create a Map to store the highest elapsedSeconds for each userId
    const userMap = new Map();

    data.forEach((item: any) => {
      const existingItem = userMap.get(item.userId);
      if (!existingItem || item.elapsedSeconds > existingItem.elapsedSeconds) {
        // Update the map if the userId is not present or the current elapsedSeconds is higher
        userMap.set(item.userId, item);
      }
    });

    // Return the values of the map as an array
    return Array.from(userMap.values());
  }

  try {
    const { where: condition, period } = querySearchParams(data);
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

    // 오늘과 6일 전 설정
    const today = new Date(Math.min(new Date().getTime(), period.to.getTime()));
    const beforeWeek = new Date(
      Math.max(
        addDays(today, -6).getTime(), // today에서 6일 전
        new Date(period.from).getTime() // period.from
      )
    );

    const userBadges = await Promise.all(
      jobGroups.map(({ stageIndex, jobIds }) =>
        prisma.userQuizBadgeStageStatistics.groupBy({
          by: ['userId', 'elapsedSeconds', 'createdAt'], // quizStageId와 createdAt으로 그룹화
          where: {
            ...where,
            createdAt: {
              gte: startOfDay(beforeWeek), // 6일 전부터
              lte: endOfDay(today), // 오늘까지
            },
            quizStageIndex: { in: stageIndex },
            jobId: { in: jobIds },
            ...(storeId
              ? storeId === '4'
                ? { storeId }
                : { OR: [{ storeId }, { storeId: null }] }
              : {}),
          },
          orderBy: { createdAt: 'asc' }, // 날짜 순 정렬
        })
      )
    );

    let experts = removeDuplicateUsers(userBadges.flat());
    experts = filterHighestElapsedSeconds(experts);

    // 날짜 범위를 생성
    const getDateRange = (start: Date, end: Date) => {
      const dates = [];
      const current = new Date(start);
      while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
      return dates;
    };

    // 날짜별 초기 데이터 생성
    const initialData = getDateRange(beforeWeek, today).map((date) => ({
      date: date.replace(/-/g, '.'), // YYYY-MM-DD -> YYYY.MM.DD
      time: 0,
    }));

    // 데이터 그룹화 및 합산
    const result = experts
      .reduce((acc, item) => {
        const dateKey = item.createdAt.toISOString().split('T')[0]; // 날짜 추출
        const match = acc.find(
          (entry: any) => entry.date === dateKey.replace(/-/g, '.')
        ); // 날짜 일치 항목 찾기

        if (match) {
          const time = item?.elapsedSeconds || 0;
          match.time += time;
        }
        return acc;
      }, initialData)
      .map((r: any) => {
        return { ...r, time: Math.round(r.time / 360) };
      });

    return result;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

export async function getUserExpertsProgress(
  data: URLSearchParams | Record<string, any>
) {
  try {
    const { where: condition, period } = querySearchParams(data);
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

    // 오늘과 6일 전 설정
    const today = addDays(
      new Date(Math.min(new Date().getTime(), period.to.getTime())),
      1
    );
    const beforeWeek = new Date(addDays(period.from, 1).getTime());
    // const beforeWeek = new Date(
    //   Math.min(
    //     addDays(today, -5).getTime(), // today포함해서 6일 전
    //     addDays(period.from, 1).getTime() // period.from
    //   )
    // );

    const userBadges = await Promise.all(
      jobGroups.map(({ stageIndex, jobIds }) =>
        prisma.userQuizBadgeStageStatistics.findMany({
          where: {
            ...where,
            createdAt: {
              gte: startOfDay(beforeWeek), // 6일 전부터
              lte: endOfDay(today), // 오늘까지
            },
            quizStageIndex: { in: stageIndex },
            jobId: { in: jobIds },
            ...(storeId
              ? storeId === '4'
                ? { storeId }
                : { OR: [{ storeId }, { storeId: null }] }
              : {}),
          },
          orderBy: { createdAt: 'asc' }, // 날짜 순 정렬
        })
      )
    );

    // 중복 userId 제거
    const experts = removeDuplicateUsers(userBadges.flat());

    // 날짜 범위를 생성
    const getDateRange = (start: Date, end: Date) => {
      const dates = [];
      const current = new Date(start);
      while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
      return dates;
    };

    // 날짜별 초기 데이터 생성
    const initialData = getDateRange(beforeWeek, today).map((date) => ({
      date: date.replace(/-/g, '.'), // YYYY-MM-DD -> YYYY.MM.DD
      total: 0,
      expert: 0,
      advanced: 0,
    }));

    // 데이터 그룹화 및 합산
    const result = experts.reduce((acc, item) => {
      const dateKey = item.createdAt.toISOString().split('T')[0]; // 날짜 추출
      const match = acc.find(
        (entry: any) => entry.date === dateKey.replace(/-/g, '.')
      ); // 날짜 일치 항목 찾기
      if (match) {
        if (item.quizStageIndex === 2) {
          match.expert += 1; // stage_2는 expert
        } else if (item.quizStageIndex === 3) {
          match.advanced += 1; // stage_3은 advanced
        }
        match.total = match.expert + match.advanced; // total 계산
      }
      return acc;
    }, initialData);

    return result;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}
