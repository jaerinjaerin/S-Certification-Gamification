import { ERROR_CODES } from '@/app/constants/error-codes';
import { auth } from '@/auth';
import { getS3Client } from '@/lib/aws/s3-client';
import { prisma } from '@/model/prisma';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { FileType } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const sesstion = await auth();

  try {
    const body = await request.formData();
    const campaignId = body.get('campaignId') as string;
    console.log('campaignId: ', campaignId);

    if (!campaignId) {
      console.error('Missing required parameter: campaign_id');
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

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
      },
    });

    if (!campaign) {
      console.error('Campaign not found');
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

    const file: File = body.get('file') as File;

    if (!file) {
      console.error('No file received');
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'No file received',
            errorCode: ERROR_CODES.NO_FILE_RECEIVED,
          },
        },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name;
    const languageCode = fileName.split('.')[0];

    const language = await prisma.language.findFirst({
      where: {
        code: languageCode,
      },
    });

    if (!language) {
      console.error('Language not found');
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `${file.name}: Language not found`,
            code: ERROR_CODES.LANGUAGE_NOT_FOUND,
          },
        },
        { status: 400 }
      );
    }

    // =============================================
    // file upload
    // =============================================
    const s3Client = getS3Client();
    const destinationKey = `certification/${campaign.slug}/messages/${file.name}`;

    // 📌 S3 업로드 실행 (PutObjectCommand 사용)
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.ASSETS_S3_BUCKET_NAME,
        Key: destinationKey,
        Body: fileBuffer,
      })
    );

    let uploadedFile = await prisma.uploadedFile.findFirst({
      where: {
        campaignId: campaign.id,
        languageId: language.id,
        fileType: FileType.UI_LANGUAGE,
      },
    });

    if (uploadedFile) {
      uploadedFile = await prisma.uploadedFile.update({
        where: {
          id: uploadedFile.id,
        },
        data: {
          uploadedBy: sesstion?.user.id,
          path: `/${destinationKey}`,
        },
      });
    } else {
      uploadedFile = await prisma.uploadedFile.create({
        data: {
          campaignId: campaign.id,
          languageId: language.id,
          uploadedBy: sesstion?.user.id ?? '',
          path: `/${destinationKey}`,
          fileType: FileType.UI_LANGUAGE,
        },
      });
    }

    return NextResponse.json(
      { success: true, result: { language, uploadedFile } },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error create campaign: ', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: ERROR_CODES.UNKNOWN,
        },
      },
      { status: 500 }
    );
  }
}
