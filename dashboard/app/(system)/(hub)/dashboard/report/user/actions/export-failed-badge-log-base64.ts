'use server';

import { createNormalExcelBlob } from '@/lib/excel';
import { prisma } from '@/model/prisma';
import { filterUsersWithoutStatus200 } from '@/utils/badge_log';
import { decrypt } from '@/utils/encrypt';
import { BadgeLog, User } from '@prisma/client';
import { Buffer } from 'buffer';

interface ExportParams {
  condition: Record<string, any>;
  period: {
    from: Date;
    to: Date;
  };
  params: {
    campaignId: string;
  };
}

export async function exportFailedBadgeLogBase64({
  condition,
  period,
  params,
}: ExportParams): Promise<string> {
  const { jobId, storeId, ...where } = condition;

  const logs: BadgeLog[] = await prisma.badgeLog.findMany({
    where: {
      campaignId: params.campaignId,
      createdAt: {
        gte: period.from,
        lte: period.to,
      },
      status: {
        not: 200, // ✅ status !== 200
      },
      domainId: where.domain,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  const userIds = logs
    .map((log) => log.userId)
    .filter((id): id is string => id !== null);
  let users: User[] = [];
  if (userIds.length > 0) {
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
      certification: campaigns.find((c) => c.id === log.campaignId)?.slug,
      domain: domains.find((d) => d.id === log.domainId)?.name,
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

  const filteredBlob = await filterUsersWithoutStatus200(blob);
  const arrayBuffer = await filteredBlob.arrayBuffer();
  return Buffer.from(arrayBuffer).toString('base64');
}
