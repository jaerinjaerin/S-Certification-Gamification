'use server';
import { prisma } from '@/model/prisma';
import { querySearchParams } from '@/lib/query';
import { buildWhereWithValidKeys } from '@/lib/where';
import { UserQuizBadgeStageStatistics } from '@prisma/client';
import { initialExpertsData, removeDuplicateUsers } from '@/lib/data';
import { URLSearchParams } from 'url';

// UserQuizStatistics 중 isCompleted 기 true 인 유저

export async function getExpertCount(
  data: URLSearchParams | Record<string, any>
) {
  try {
    const { where: condition } = querySearchParams(data);
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

    return userGroupByUserId.length;
  } catch (error) {
    console.error('Error fetching data:', error);
    return 0;
  }
}

export async function getExpertByGroup(
  data: URLSearchParams | Record<string, any>
) {
  async function fetchUserStatistics(
    where: any,
    jobGroup: { id: string; code: string }[],
    moreWhere: any
  ) {
    return prisma.userQuizBadgeStageStatistics.findMany({
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
        ...moreWhere,
      },
    });
  }

  async function processUserStatistics(
    users: UserQuizBadgeStageStatistics[],
    jobGroup: { id: string; code: string }[],
    expertsData: any
  ) {
    // quizStageIndex기준 낮은 index일 때 중복되는 userId를 가진 아이템 제거
    removeDuplicateUsers(users).forEach((user) => {
      const jobName = jobGroup.find((j) => j.id === user.jobId)?.code;
      if (jobName) {
        expertsData.items.forEach((item: { title: string; value: number }) => {
          if (item.title === jobName) {
            item.value++;
          }
        });
      }
    });
  }

  try {
    const { where: condition } = querySearchParams(data);
    const { jobId, ...where } = condition;

    const expertsData: ImprovedDataStructure = JSON.parse(
      JSON.stringify(initialExpertsData)
    );

    const jobGroup = await prisma.job.findMany({
      where: jobId ? { code: jobId } : {},
      select: { id: true, code: true },
    });

    const plusUsers = await fetchUserStatistics(where, jobGroup, {
      OR: [{ storeId: { not: '4' } }, { storeId: null }],
    });
    processUserStatistics(plusUsers, jobGroup, expertsData[0]);
    //
    const sesUsers = await fetchUserStatistics(where, jobGroup, {
      storeId: '4',
    });
    processUserStatistics(sesUsers, jobGroup, expertsData[1]);

    return expertsData;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

export async function getExpertsData(
  data: URLSearchParams | Record<string, any>
) {
  async function fetchUserStatistics(
    where: any,
    jobGroup: { id: string; code: string }[],
    moreWhere: any
  ) {
    return prisma.userQuizBadgeStageStatistics.findMany({
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
        quizStageIndex: { in: [2, 3] },
        jobId: { in: jobGroup.map((job) => job.id) },
        ...moreWhere,
      },
    });
  }

  async function processUserData(
    users: UserQuizBadgeStageStatistics[],
    jobGroup: { id: string; code: string }[],
    jobData: any,
    isSES: boolean = false
  ) {
    // quizStageIndex기준 낮은 index일 때 중복되는 userId를 가진 아이템 제거
    removeDuplicateUsers(users).forEach((user) => {
      const jobNameBase = jobGroup.find((j) => j.id === user.jobId)?.code;
      if (!jobNameBase) return;

      const jobName = isSES ? `${jobNameBase} (SES)` : jobNameBase;

      jobData.forEach(
        (item: { name: string; expert: number; advanced: number }) => {
          if (item.name === jobName.toUpperCase()) {
            if (user.quizStageIndex === 3) {
              item.advanced += 1;
            } else if (user.quizStageIndex === 2) {
              item.expert += 1;
            }
          }
        }
      );
    });
  }

  try {
    const { where: condition } = querySearchParams(data);
    const { jobId, ...where } = condition;

    // bar chart
    const jobData = [
      { name: 'FSM', expert: 0, advanced: 0 },
      { name: 'FF', expert: 0, advanced: 0 },
      { name: 'FSM (SES)', expert: 0, advanced: 0 },
      { name: 'FF (SES)', expert: 0, advanced: 0 },
    ];
    const jobGroup = await prisma.job.findMany({
      where: jobId ? { code: jobId } : {},
      select: { id: true, code: true },
    });

    const plusUsers = await fetchUserStatistics(where, jobGroup, {
      OR: [{ storeId: { not: '4' } }, { storeId: null }],
    });
    processUserData(plusUsers, jobGroup, jobData);

    const sesUsers = await fetchUserStatistics(where, jobGroup, {
      storeId: '4',
    });
    processUserData(sesUsers, jobGroup, jobData, true);

    // pie chart
    const pie = [
      {
        name: 'expert',
        value: jobData.reduce((acc, item) => acc + item.expert, 0),
      },
      {
        name: 'advanced',
        value: jobData.reduce((acc, item) => acc + item.advanced, 0),
      },
    ];

    const count = pie.reduce((acc, item) => acc + item.value, 0);
    return { pie, bar: jobData, count };
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}
