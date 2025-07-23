import { convertUi } from '@/app/(system)/(hub)/cms/_utils/convert-excel-json';
import { ERROR_CODES } from '@/app/constants/error-codes';
import { auth } from '@/auth';
import { invalidateCache } from '@/lib/aws/cloudfront';
import { getS3Client } from '@/lib/aws/s3-client';
import { prisma } from '@/model/prisma';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { FileType } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const session = await auth();

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

    const result = await convertUi(file);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: result.errorMessage,
            code: ERROR_CODES.EXCEL_PROCESSING_ERROR,
          },
        },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name;
    const languageCode = fileName.split('.')[0].split('_')[0];

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

    const domainWebLanguage = await prisma.domainWebLanguage.findFirst({
      where: {
        campaignId: campaign.id,
        languageId: language.id,
      },
    });

    if (!domainWebLanguage) {
      await prisma.domainWebLanguage.create({
        data: {
          campaignId: campaign.id,
          languageId: language.id,
        },
      });
    }

    // =============================================
    // file upload
    // =============================================
    const s3Client = getS3Client();
    console.log('file.name: ', file.name);
    const destinationKey = `certification/${campaign.slug}/messages/${file.name}`;
    // const destinationKey = `certification/${campaign.slug}/cms/upload/messages/${file.name}`;

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

    console.log('uploadedFile: ', uploadedFile, `/${destinationKey}`);

    if (uploadedFile) {
      uploadedFile = await prisma.uploadedFile.update({
        where: {
          id: uploadedFile.id,
        },
        data: {
          uploadedBy: session?.user.id,
          path: `/${destinationKey}`,
        },
      });

      console.log('uploadedFile: ', uploadedFile);
    } else {
      uploadedFile = await prisma.uploadedFile.create({
        data: {
          campaignId: campaign.id,
          languageId: language.id,
          uploadedBy: session?.user.id ?? '',
          path: `/${destinationKey}`,
          fileType: FileType.UI_LANGUAGE,
        },
      });
    }

    // const result = await convertUi(file);
    const path = `certification/${campaign.slug}/messages`;
    const key = `${path}/${languageCode}.json`;
    // const json = jsonToFile({
    //   filename: `${languageCode}.json`,
    //   json: result.result,
    // });
    // await uploadToS3({ key, file, isNoCache: true });
    const jsonString = JSON.stringify(result.result, null, 2);
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.ASSETS_S3_BUCKET_NAME,
        Key: key,
        Body: jsonString,
      })
    );

    invalidateCache(process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID!, [
      `/${destinationKey}`,
      `/${key}`,
    ]);

    return NextResponse.json(
      { success: true, result: { language, uploadedFile } },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error upload ui language: ', error);
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
