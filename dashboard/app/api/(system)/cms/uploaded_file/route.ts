import { ERROR_CODES } from '@/app/constants/error-codes';
import { prisma } from '@/model/prisma';
import { FileType } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get('campaignId');
  const fileType = searchParams.get('fileType');

  if (!campaignId || !fileType) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Missing required parameter: campaign_id',
          code: ERROR_CODES.MISSING_REQUIRED_PARAMETER,
        },
      },
      { status: 400 }
    );
  }

  // fileType이 enum에 포함되는지 확인
  if (!Object.values(FileType).includes(fileType as FileType)) {
    return NextResponse.json(
      { success: false, message: '지원하지 않는 fileType입니다.' },
      { status: 400 }
    );
  }

  try {
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
      },
    });

    if (campaign == null) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Campaign not found',
            code: ERROR_CODES.CAMPAIGN_NOT_FOUND,
          },
        },
        { status: 404 }
      );
    }

    const uploadedFiles = await prisma.uploadedFile.findMany({
      where: {
        campaignId,
        fileType: fileType as FileType,
      },
    });

    return NextResponse.json(
      { success: true, result: { uploadedFiles } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
