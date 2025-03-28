import { createNormalExcelBlob } from '@/lib/excel';
import { querySearchParams } from '@/lib/query';
import { prisma } from '@/model/prisma';
import { decrypt } from '@/utils/encrypt';
import { BadgeLog, User } from '@prisma/client';
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

    const userIds = logs
      .map((log) => log.userId)
      .filter((id): id is string => id !== null);
    let users: User[] = [];
    if (userIds && userIds.length > 0) {
      users = await prisma.user.findMany({
        where: {
          id: {
            in: userIds,
          },
        },
      });
    }

    const campaigns = await prisma.campaign.findMany();
    const domains = await prisma.domain.findMany();

    const result = logs.map((log, index) => {
      const providerUserId = users.find(
        (user) => user.id === log.userId
      )?.providerUserId;
      const eId = providerUserId ? decrypt(providerUserId, true) : null;
      return {
        no: index + 1,
        certification: campaigns.find(
          (campaign) => campaign.id === log.campaignId
        )?.slug,
        domain: domains.find((domain) => domain.id === log.domainId)?.name,
        api: log.apiType,
        status: log.status,
        message: log.message,
        userId: log.userId,
        eId,
        accountId: log.accountUserId,
        activityId: log.activityId,
        accessToken: log.accessToken,
        raw: log.rawLog,
        createdAt: log.createdAt.toISOString(),
      };
    });

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
        { header: 'eId', key: 'eId', width: 10 },
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
