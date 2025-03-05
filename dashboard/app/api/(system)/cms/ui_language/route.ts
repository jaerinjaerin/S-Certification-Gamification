import { ERROR_CODES } from '@/app/constants/error-codes';
import { prisma } from '@/model/prisma';
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

    const uploadedFiles = await prisma.uploadedFile.findMany({
      where: {
        fileType: FileType.UI_LANGUAGE,
        campaignId: campaignId,
      },
    });

    const languages = await prisma.language.findMany();

    const groupedLanguages = uploadedFiles.map((file) => {
      const language = languages.find((lang) => lang.id === file.languageId);
      return { file, language };
    });

    return NextResponse.json(
      { success: true, result: { groupedLanguages } },
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
