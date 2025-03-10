'use server';
import { prisma } from '@/model/prisma';
import { querySearchParams } from '@/lib/query';
import { buildWhereWithValidKeys } from '@/lib/where';
import { UserQuizBadgeStageStatistics } from '@prisma/client';
import {
  getJobIds,
  initialExpertsData,
  removeDuplicateUsers,
} from '@/lib/data';
import { URLSearchParams } from 'url';

export async function getExpertCount(
  data: URLSearchParams | Record<string, any>
) {
  try {
    const { where: condition } = querySearchParams(data);
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
        stageIndex: settings.ffFirstBadgeStageIndex! || -1,
        jobIds: jobGroup.ff,
      },
      {
        key: 'fsm',
        stageIndex: settings.fsmFirstBadgeStageIndex! || -1,
        jobIds: jobGroup.fsm,
      },
    ];

    const users = await Promise.all(
      jobGroups.map(({ stageIndex, jobIds }) =>
        prisma.userQuizBadgeStageStatistics.groupBy({
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
            quizStageIndex: stageIndex,
            jobId: { in: jobIds },
            ...(storeId
              ? storeId === '4'
                ? { storeId }
                : { OR: [{ storeId }, { storeId: null }] }
              : {}),
          },
          _count: { userId: true },
        })
      )
    );

    return users.reduce((total, group) => total + group.length, 0);
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
    stageIndex: number,
    jobGroup: string[],
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
        quizStageIndex: stageIndex,
        jobId: { in: jobGroup },
        ...moreWhere,
      },
    });
  }

  async function processUserStatistics(
    users: UserQuizBadgeStageStatistics[],
    jobGroup: Record<string, string[]>,
    expertsData: any
  ) {
    // quizStageIndex기준 낮은 index일 때 중복되는 userId를 가진 아이템 제거
    removeDuplicateUsers(users).forEach((user) => {
      const jobName =
        (Object.keys(jobGroup) as Array<keyof typeof jobGroup>).find((key) =>
          jobGroup[key].includes(user.jobId)
        ) || null;
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

    const settings = await prisma.campaignSettings.findFirst({
      where: { campaignId: where.campaignId },
    });

    if (!settings) {
      throw new Error('Campaign settings not found');
    }

    const expertsData: ImprovedDataStructure = JSON.parse(
      JSON.stringify(initialExpertsData)
    );

    const jobGroup = await getJobIds(jobId);

    const jobGroups = [
      {
        key: 'ff',
        stageIndex: settings.ffFirstBadgeStageIndex! || -1,
        jobIds: jobGroup.ff,
      },
      {
        key: 'fsm',
        stageIndex: settings.fsmFirstBadgeStageIndex! || -1,
        jobIds: jobGroup.fsm,
      },
    ];

    const plusUsers = await Promise.all(
      jobGroups.map(({ stageIndex, jobIds }) =>
        fetchUserStatistics(where, stageIndex, jobIds, {
          OR: [{ storeId: { not: '4' } }, { storeId: null }],
        })
      )
    );

    plusUsers.forEach((plusUser, index) => {
      processUserStatistics(plusUser, jobGroup, expertsData[0]);
    });
    //
    const sesUsers = await Promise.all(
      jobGroups.map(({ stageIndex, jobIds }) =>
        fetchUserStatistics(where, stageIndex, jobIds, {
          storeId: '4',
        })
      )
    );

    sesUsers.forEach((sesUser, index) => {
      processUserStatistics(sesUser, jobGroup, expertsData[1]);
    });

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
    stageIndexes: number[],
    jobGroup: string[],
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
        quizStageIndex: { in: stageIndexes },
        jobId: { in: jobGroup },
        ...moreWhere,
      },
    });
  }

  async function processUserData(
    users: UserQuizBadgeStageStatistics[],
    stageIndexes: { ff: number[]; fsm: number[] },
    jobGroup: Record<string, string[]>,
    jobData: any,
    isSES: boolean = false
  ) {
    // quizStageIndex기준 낮은 index일 때 중복되는 userId를 가진 아이템 제거
    removeDuplicateUsers(users).forEach((user) => {
      const jobNameBase =
        (Object.keys(jobGroup) as Array<keyof typeof jobGroup>).find((key) =>
          jobGroup[key].includes(user.jobId)
        ) || null;
      if (!jobNameBase) return;

      const jobName = isSES ? `${jobNameBase} (SES)` : jobNameBase;
      const stage = jobNameBase === 'ff' ? stageIndexes.ff : stageIndexes.fsm;

      jobData.forEach(
        (item: { name: string; expert: number; advanced: number }) => {
          if (item.name === jobName.toUpperCase()) {
            if (user.quizStageIndex === stage[1]) {
              item.advanced += 1;
            } else if (user.quizStageIndex === stage[0]) {
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

    const stageGroups = {
      ff: jobGroups[0].stageIndex,
      fsm: jobGroups[1].stageIndex,
    };

    // bar chart
    const jobData = [
      { name: 'FSM', expert: 0, advanced: 0 },
      { name: 'FF', expert: 0, advanced: 0 },
      { name: 'FSM (SES)', expert: 0, advanced: 0 },
      { name: 'FF (SES)', expert: 0, advanced: 0 },
    ];

    const plusUsers = await Promise.all(
      jobGroups.map(({ stageIndex, jobIds }) =>
        fetchUserStatistics(where, stageIndex, jobIds, {
          OR: [{ storeId: { not: '4' } }, { storeId: null }],
        })
      )
    );

    plusUsers.forEach((plusUser, index) => {
      processUserData(plusUser, stageGroups, jobGroup, jobData);
    });
    //
    const sesUsers = await Promise.all(
      jobGroups.map(({ stageIndex, jobIds }) =>
        fetchUserStatistics(where, stageIndex, jobIds, {
          storeId: '4',
        })
      )
    );

    sesUsers.forEach((sesUser, index) => {
      processUserData(sesUser, stageGroups, jobGroup, jobData, true);
    });

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
