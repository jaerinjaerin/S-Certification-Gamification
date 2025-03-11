/* eslint-disable @typescript-eslint/no-unused-vars */

import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/utils/encrypt';
import { createNormalExcelBlob } from '@/lib/excel';
import { querySearchParams } from '@/lib/query';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where: condition, period } = querySearchParams(searchParams);
    const { jobId, storeId, ...where } = condition;

    const jobGroup = await prisma.job.findMany({
      where: jobId ? { code: jobId } : {},
      select: { id: true, code: true },
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

    const result = logs.map((log, index) => ({
      no: index + 1,
      eid: userMap.get(log.userId) || null,
      stage: log.lastCompletedStage ? log.lastCompletedStage + 1 : 0,
    }));

    const blob = await createNormalExcelBlob({
      sheetName: 'User Stage Progress',
      columns: [
        { header: 'No', key: 'no', width: 10 },
        { header: 'Employee ID', key: 'eid', width: 30 },
        { header: 'Stage', key: 'stage', width: 10 },
      ],
      data: result,
    });

    const { createdAt, campaignId, authType, ...args } = condition;
    const range = `${period.from.toISOString().split('T')[0]}_to_${period.to.toISOString().split('T')[0]}`;
    const filename = `user_stage_progress_data_${range}${args ? Object.values(args).reduce((acc, item) => `${acc}_${item}`, '') : ''}.xlsx`;

    return new Response(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
