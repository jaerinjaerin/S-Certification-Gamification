export const dynamic = 'force-dynamic';
import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { initialExpertsData } from '@/app/(system)/dashboard/overview/@infoExpertsByGroup/_lib/state';
import { querySearchParams } from '../../../_lib/query';
import { buildWhereWithValidKeys } from '../../../_lib/where';

// UserQuizStatistics 사용
// isCompleted 이면 퀴즈 완료
// jodId와 storeId 정보를 가지고 그룹핑 해야함
// jobId로 Job 정보 참조. job의 group을 사용
// storeId가 4인 경우 SES 유저. 아니면 SES 유저 아님

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where: condition } = querySearchParams(searchParams);
    const { jobId, ...where } = condition;

    await prisma.$connect();

    const expertsData: ImprovedDataStructure = JSON.parse(
      JSON.stringify(initialExpertsData)
    );

    const jobGroup = await prisma.job.findMany({
      where: jobId ? { group: jobId } : {},
      select: { id: true, group: true },
    });

    if (where?.storeId && where.storeId !== '4') {
      const plus = await prisma.userQuizBadgeStageStatistics.findMany({
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

      plus.forEach((user) => {
        const jobName = jobGroup.find((j) => j.id === user.jobId)?.group;
        if (jobName) {
          expertsData[0].items.forEach((item) => {
            if (item.title === jobName) {
              item.value++;
            }
          });
        }
      });

      expertsData[1].items.forEach((item) => {
        item.value = 0;
      });
      //
      return NextResponse.json({ result: expertsData });
    } else if (where?.storeId && where.storeId === '4') {
      const ses = await prisma.userQuizBadgeStageStatistics.findMany({
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
          storeId: '4',
        },
      });

      ses.forEach((user) => {
        const jobName = jobGroup.find((j) => j.id === user.jobId)?.group;
        if (jobName) {
          expertsData[1].items.forEach((item) => {
            if (item.title === jobName) {
              item.value++;
            }
          });
        }
      });

      expertsData[0].items.forEach((item) => {
        item.value = 0;
      });

      return NextResponse.json({ result: expertsData });
    }

    //
    const plus = await prisma.userQuizBadgeStageStatistics.findMany({
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
        OR: [{ storeId: null }, { storeId: { not: '4' } }],
        jobId: { in: jobGroup.map((job) => job.id) },
      },
    });

    plus.forEach((user) => {
      const jobName = jobGroup.find((j) => j.id === user.jobId)?.group;
      if (jobName) {
        expertsData[0].items.forEach((item) => {
          if (item.title === jobName) {
            item.value++;
          }
        });
      }
    });

    const ses = await prisma.userQuizBadgeStageStatistics.findMany({
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
        storeId: '4',
      },
    });

    ses.forEach((user) => {
      const jobName = jobGroup.find((j) => j.id === user.jobId)?.group;
      if (jobName) {
        expertsData[1].items.forEach((item) => {
          if (item.title === jobName) {
            item.value++;
          }
        });
      }
    });

    return NextResponse.json({ result: expertsData });
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
