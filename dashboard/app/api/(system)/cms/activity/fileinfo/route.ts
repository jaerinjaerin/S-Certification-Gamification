import { ERROR_CODES } from '@/app/constants/error-codes';
import { prisma } from '@/model/prisma';
import { decrypt } from '@/utils/encrypt';
import { FileType } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get('campaignId');

  if (!campaignId) {
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

    const file = await prisma.uploadedFile.findFirst({
      where: { campaignId: campaignId, fileType: FileType.ACTIVITYID },
      select: { createdAt: true, updatedAt: true, uploadedBy: true },
      orderBy: { updatedAt: 'desc' },
    });

    if (!file) {
      return NextResponse.json(ERROR_CODES.NO_FILE_RECEIVED, { status: 404 });
    }

    const updatedByNameResult = await prisma.user.findUnique({
      where: { id: file?.uploadedBy },
      select: { loginName: true },
    });

    const result = {
      updatedAt: file?.updatedAt ?? file.createdAt,
      updatedBy: updatedByNameResult?.loginName
        ? decrypt(updatedByNameResult.loginName, true)
        : null,
    } as typeof file & { updatedBy: string | null };

    return NextResponse.json({ success: true, result }, { status: 200 });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
