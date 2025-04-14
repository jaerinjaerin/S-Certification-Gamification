import { getChannelName, getChannelSegmentName } from '@/lib/channel';
import { createNormalExcelBlob } from '@/lib/excel';
import { querySearchParams } from '@/lib/query';
import { extendedQuery } from '@/lib/sql';
import { prisma } from '@/model/prisma';
import { decrypt } from '@/utils/encrypt';
import { AuthType, Job, User, UserQuizStatistics } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where: condition, period } = querySearchParams(searchParams);
    const { jobId, storeId, ...where } = condition;

    const jobGroup: Job[] = await extendedQuery(
      prisma,
      'Job',
      jobId ? { code: jobId } : {},
      { select: ['id', 'code'] }
    );

    console.log('searchParams:', searchParams);
    console.log('where:', where);

    const logs: UserQuizStatistics[] = await extendedQuery(
      prisma,
      'UserQuizStatistics',
      {
        // ...where,
        campaignId: where.campaignId,
        updatedAt: where.createdAt,
        jobId: { in: jobGroup.map((job) => job.id) },
        ...(storeId
          ? storeId === '4'
            ? { storeId }
            : { OR: [{ storeId }, { storeId: null }] }
          : {}),
      },
      {
        select: [
          'userId',
          'lastCompletedStage',
          'authType',
          'channelId',
          'channelSegmentId',
          'channelName',
          'domainId',
        ],
      }
    );

    const users: User[] = await extendedQuery(
      prisma,
      'users',
      {
        id: { in: logs.map((log) => log.userId) },
      },
      {
        select: [
          'id',
          'providerUserId',
          'emailId',
          'authType',
          'channelId',
          'channelSegmentId',
          'channelName',
          'domainId',
        ],
      }
    );

    const domains = await prisma.domain.findMany();

    const userMap = new Map(
      users.map((user) => {
        const identifier =
          user.authType === 'SUMTOTAL'
            ? user.providerUserId
              ? decrypt(user.providerUserId, true)
              : null
            : user.emailId
              ? decrypt(user.emailId, true)
              : null;
        return [user.id, identifier];
      })
    );

    const result = logs.map((log, index) => {
      return {
        no: index + 1,
        authType: log.authType === AuthType.SUMTOTAL ? 'SumTotal' : 'Email',
        domain: domains.find((domain) => domain.id === log.domainId)?.name,
        eid: userMap.get(log.userId) || null,
        stage: log.lastCompletedStage ? log.lastCompletedStage + 1 : 0,
        channelId: log.channelId?.toString() || '',
        channelSegmentId: log.channelSegmentId?.toString() || '',
        channel: log.channelId ? getChannelName(log.channelId) : '',
        channelSegment: log.channelSegmentId
          ? getChannelSegmentName(log.channelSegmentId)
          : '',
        channelName: log.authType === AuthType.GUEST ? log.channelName : '',
      };
    });

    const blob = await createNormalExcelBlob({
      sheetName: 'User Stage Progress',
      columns: [
        { header: 'No', key: 'no', width: 10 },
        { header: 'Auth Type', key: 'authType', width: 30 },
        { header: 'Domain', key: 'domain', width: 10 },
        { header: 'Employee ID', key: 'eid', width: 30 },
        { header: 'Stage', key: 'stage', width: 10 },
        { header: 'ChannelId', key: 'channelId', width: 20 },
        { header: 'ChannelSegmentId', key: 'channelSegmentId', width: 20 },
        { header: 'Channel', key: 'channel', width: 50 },
        { header: 'ChannelSegment', key: 'channelSegment', width: 50 },
        { header: 'ChannelName', key: 'channelName', width: 20 },
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
