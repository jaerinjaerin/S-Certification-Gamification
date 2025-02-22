/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getFromS3 } from '@/lib/s3-client';
import { NextRequest, NextResponse } from 'next/server';
import { getPath } from '@/lib/file';
import { prisma } from '@/model/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const campaignId = (searchParams.get('campaign') ||
      'ac2fb618-384f-41aa-ab06-51546aeacd32') as string;
    console.log('🚀 ~ GET ~ campaignId:', campaignId);

    await prisma.$connect();

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    const campaignName = (campaign?.name || 'unknown').toLowerCase();
    const path = getPath(campaignName, 'target');
    const key = `${path}/target_${campaignName}.xlsx`;

    const response = await getFromS3({ key, isNoCache: true });
    if (!response?.Body) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Data not found',
            details: 'Target data not found',
          },
        },
        { status: 404 }
      );
    }

    // 스트림 데이터를 버퍼로 변환
    const buffer = await response.Body.transformToByteArray();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': response.ContentType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename=${key.split('/').pop()}`,
      },
    });
  } catch (error: any) {
    console.error('Error Domain Data:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: 'Internal server error',
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}
