import { removeDuplicateUsers } from '@/lib/data';
import { querySearchParams } from '@/lib/query';
import { extendedQuery, queryRawWithWhere } from '@/lib/sql';
import { prisma } from '@/model/prisma';
import { decrypt } from '@/utils/encrypt';
import { Job, User, UserQuizStatistics } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where: condition, take, skip } = querySearchParams(searchParams);
    const { jobId, storeId, ...where } = condition;

    const jobGroup: Job[] = await extendedQuery(
      prisma,
      'Job',
      jobId ? { code: jobId } : {},
      { select: ['id', 'code'] }
    );

    const userLogs: UserQuizStatistics[] = await queryRawWithWhere(
      prisma,
      'UserQuizStatistics',
      {
        ...where,
        jobId: { in: jobGroup.map((job) => job.id) },
        ...(storeId
          ? storeId === '4'
            ? { storeId }
            : { OR: [{ storeId }, { storeId: null }] }
          : {}),
      }
    );
    const count = removeDuplicateUsers(userLogs).length;

    const logs: UserQuizStatistics[] = await extendedQuery(
      prisma,
      'UserQuizStatistics',
      {
        ...where,
        jobId: { in: jobGroup.map((job) => job.id) },
        ...(storeId
          ? storeId === '4'
            ? { storeId }
            : { OR: [{ storeId }, { storeId: null }] }
          : {}),
      },
      { select: ['userId', 'lastCompletedStage'], limit: take, offset: skip }
    );

    const users: User[] = await extendedQuery(
      prisma,
      'users',
      {
        id: { in: logs.map((log) => log.userId) },
      },
      { select: ['id', 'providerUserId'] }
    );

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
