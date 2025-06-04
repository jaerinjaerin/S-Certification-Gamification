/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getFromS3, getFromS3Folder } from '@/lib/s3-client';
import { NextRequest, NextResponse } from 'next/server';
import { getPath } from '@/lib/file';
import { prisma } from '@/model/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const campaignSlug = searchParams.get('campaignSlug') as string;

    await prisma.$connect();

    const path = getPath(campaignSlug, 'target');
    const key = `${path}/target_${campaignSlug}.xlsx`;

    // const response = await getFromS3({ key, isNoCache: true });
    const response = await getFromS3Folder({ path, isNoCache: true });

    // if (!response?.Body) {
    if (!response) {
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
    // const buffer = await response.Body.transformToByteArray();

    // return new NextResponse(buffer, {
    //   status: 200,
    //   headers: {
    //     'Content-Type': response.ContentType || 'application/octet-stream',
    //     'Content-Disposition': `attachment; filename=${key.split('/').pop()}`,
    //   },
    // });

    return NextResponse.json({ success: true, data: response[0] });
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
