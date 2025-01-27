import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { querySearchParams } from '../../../_lib/query';

// UserQuizStatistics, DomainGoal사용
// DomainGoal - ff,fsm,ffses,fsmses의 합이 국가별 총 목표수

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where } = querySearchParams(searchParams);
    const names = { expert: 'expert', advanced: 'advanced' };

    await prisma.$connect();

    // pie chart
    const expertCount = await prisma.userQuizBadgeStageStatistics.count({
      where: {
        ...where,
        quizStageIndex: 2,
      },
    });

    const advancedCount = await prisma.userQuizBadgeStageStatistics.count({
      where: { ...where, quizStageIndex: 3 },
    });

    const pie = [
      { name: names.expert, value: expertCount - advancedCount },
      { name: names.advanced, value: advancedCount },
    ];

    // bar chart

    const jobData = [
      { name: 'FSM', [names.expert]: 0, [names.advanced]: 0 },
      { name: 'FF', [names.expert]: 0, [names.advanced]: 0 },
      { name: 'FSM (SES)', [names.expert]: 0, [names.advanced]: 0 },
      { name: 'FF (SES)', [names.expert]: 0, [names.advanced]: 0 },
    ];
    const jobGroup = await prisma.job.findMany({
      select: { id: true, group: true },
    });

    const plus = await prisma.userQuizBadgeStageStatistics.findMany({
      where: {
        ...where,
        quizStageIndex: { in: [2, 3] },
        storeId: { not: '4' },
      },
    });

    plus.forEach((user) => {
      const jobName = jobGroup.find((j) => j.id === user.jobId)?.group;
      if (jobName) {
        jobData.forEach((item) => {
          if (item.name === jobName.toUpperCase()) {
            if (user.quizStageIndex === 3) {
              item[names.advanced] = (item[names.advanced] as number) + 1;
              item[names.expert] = (item[names.expert] as number) - 1;
            } else if (user.quizStageIndex === 2) {
              item[names.expert] = (item[names.expert] as number) + 1;
            }
          }
        });
      }
    });

    const ses = await prisma.userQuizBadgeStageStatistics.findMany({
      where: { ...where, quizStageIndex: { in: [2, 3] }, storeId: '4' },
    });

    ses.forEach((user) => {
      const jobName = jobGroup.find((j) => j.id === user.jobId)?.group;
      if (jobName) {
        const jobNamewithSes = `${jobName} (SES)`;
        jobData.forEach((item) => {
          if (item.name === jobNamewithSes.toUpperCase()) {
            if (user.quizStageIndex === 3) {
              item[names.advanced] = (item[names.advanced] as number) + 1;
              item[names.expert] = (item[names.expert] as number) - 1;
            } else if (user.quizStageIndex === 2) {
              item[names.expert] = (item[names.expert] as number) + 1;
            }
          }
        });
      }
    });

    return NextResponse.json({ result: { pie, bar: jobData } });
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
