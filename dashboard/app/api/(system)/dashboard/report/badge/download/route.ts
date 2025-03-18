import { createNormalExcelBlob } from '@/lib/excel';
import { querySearchParams } from '@/lib/query';
import { extendedQuery } from '@/lib/sql';
import { prisma } from '@/model/prisma';
import { BadgeLog, Job } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const {
      where: condition,
      period,
      params,
    } = querySearchParams(searchParams);
    const { jobId, storeId, ...where } = condition;

    const jobGroup: Job[] = await extendedQuery(
      prisma,
      'Job',
      jobId ? { code: jobId } : {},
      { select: ['id', 'code'] }
    );

    // console.log('searchParams:', searchParams);
    // console.log('where:', where);
    // console.log('params:', params);

    const logs: BadgeLog[] = await prisma.badgeLog.findMany({
      where: {
        campaignId: params.campaignId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // console.log('logs:', logs);

    // const logs: UserQuizLog[] = await extendedQuery(
    //   prisma,
    //   'UserQuizLog',
    //   {
    //     ...where,
    //     jobId: { in: jobGroup.map((job) => job.id) },
    //     ...(storeId
    //       ? storeId === '4'
    //         ? { storeId }
    //         : { OR: [{ storeId }, { storeId: null }] }
    //       : {}),
    //   },
    //   { select: ['userId', 'lastCompletedStage'] }
    // );

    // const users: User[] = await extendedQuery(
    //   prisma,
    //   'users',
    //   {
    //     id: { in: logs.map((log) => log.userId) },
    //   },
    //   { select: ['id', 'providerUserId'] }
    // );

    // const userMap = new Map(
    //   users.map((user) => {
    //     const employeeId = user.providerUserId
    //       ? decrypt(user.providerUserId, true)
    //       : null;
    //     return [user.id, employeeId];
    //   })
    // );

    // const result = logs.map((log, index) => ({
    //   no: index + 1,
    //   eid: userMap.get(log.userId) || null,
    //   stage: log.lastCompletedStage ? log.lastCompletedStage + 1 : 0,
    // }));

    const campaigns = await prisma.campaign.findMany();
    const domains = await prisma.domain.findMany();

    const result = logs.map((log, index) => ({
      no: index + 1,
      certification: campaigns.find(
        (campaign) => campaign.id === log.campaignId
      )?.slug,
      domain: domains.find((domain) => domain.id === log.domainId)?.name,
      api: log.apiType,
      status: log.status,
      message: log.message,
      userId: log.userId,
      accountId: log.accountUserId,
      activityId: log.activityId,
      accessToken: log.accessToken,
      raw: log.rawLog,
      createdAt: log.createdAt.toISOString(),
    }));

    const blob = await createNormalExcelBlob({
      sheetName: 'User Stage Progress',
      columns: [
        { header: 'No', key: 'no', width: 10 },
        { header: 'certification', key: 'certification', width: 10 },
        { header: 'domain', key: 'domain', width: 10 },
        { header: 'api', key: 'api', width: 30 },
        { header: 'status', key: 'status', width: 10 },
        { header: 'message', key: 'message', width: 10 },
        { header: 'userId', key: 'userId', width: 10 },
        { header: 'accountId', key: 'accountId', width: 10 },
        { header: 'activityId', key: 'activityId', width: 10 },
        { header: 'accessToken', key: 'accessToken', width: 10 },
        { header: 'raw', key: 'raw', width: 10 },
        { header: 'createdAt', key: 'createdAt', width: 10 },
      ],
      data: result,
    });

    const { createdAt, campaignId, authType, ...args } = condition;
    const range = `${period.from.toISOString().split('T')[0]}_to_${period.to.toISOString().split('T')[0]}`;
    const filename = `badge_log_${range}${args ? Object.values(args).reduce((acc, item) => `${acc}_${item}`, '') : ''}.xlsx`;

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
