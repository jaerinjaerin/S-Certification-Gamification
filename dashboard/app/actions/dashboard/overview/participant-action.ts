'use server';
import { prisma } from '@/model/prisma';
import { paramsToQueries } from '@/app/api/(system)/dashboard/_lib/query';
import { buildWhereWithValidKeys } from '@/app/api/(system)/dashboard/_lib/where';

// UserQuizStatistics 사용

export async function getParticipantCount(data: Record<string, any>) {
  try {
    const { where: condition } = paramsToQueries(data);
    const { jobId, storeId, ...where } = condition;

    const jobGroup = await prisma.job.findMany({
      where: jobId ? { code: jobId } : {},
      select: { id: true, code: true },
    });

    const count = await prisma.userQuizStatistics.count({
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
        jobId: { in: jobGroup.map((job) => job.id) },
        ...(storeId
          ? storeId === '4'
            ? { storeId }
            : { OR: [{ storeId }, { storeId: null }] }
          : {}),
      },
    });
    return count;
  } catch (error) {
    console.error('Error fetching data:', error);
    return 0;
  }
}
