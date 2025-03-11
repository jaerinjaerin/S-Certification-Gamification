import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/utils/encrypt';
import { querySearchParams } from '@/lib/query';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where: condition, take, skip } = querySearchParams(searchParams);
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

    return NextResponse.json({ result: { data: result, total: count } });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { result: { data: [], total: 0 }, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
