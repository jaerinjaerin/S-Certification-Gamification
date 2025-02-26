import { ERROR_CODES } from '@/app/constants/error-codes';
import { auth } from '@/auth';
import {
  parseExcelBufferToDomainJson,
  ProcessResult,
} from '@/lib/nomember-excel-parser';
import { prisma } from '@/model/prisma';
import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from '@aws-sdk/client-cloudfront';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { fromIni } from '@aws-sdk/credential-provider-ini';
import { FileType } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  const sesstion = await auth();

  try {
    // ✅ `req.body`를 `Buffer`로 변환 (Node.js `IncomingMessage`와 호환)
    const body = await request.formData();

    // Get the file from the form data
    const file: File = body.get('file') as File;
    const campaignId = body.get('campaignId') as string;
    console.log('file: ', file);

    if (!campaignId) {
      console.error('Missing required parameter: campaign_id');
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Missing required parameter: campaign_id',
            errorCode: ERROR_CODES.MISSING_REQUIRED_PARAMETER,
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
            errorCode: ERROR_CODES.CAMPAIGN_NOT_FOUND,
          },
        },
        { status: 404 }
      );
    }

    // Check if a file is received
    if (!file) {
      // If no file is received, return a JSON response with an error and a 400 status code
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

    let uploadedFile = await prisma.uploadedFile.findFirst({
      where: {
        fileType: FileType.NON_SPLUS_DOMAINS,
        campaignId: campaign.id,
      },
    });

    // if (uploadedFile) {
    //   if (file.name !== uploadedFile.path.split('/').pop()) {
    //     console.error('Different file name');
    //     return NextResponse.json(
    //       {
    //         success: false,
    //         error: {
    //           message: 'Different file name',
    //           errorCode: ERROR_CODES.FILE_NAME_MISMATCH,
    //         },
    //       },
    //       { status: 400 }
    //     );
    //   }
    // }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const result: ProcessResult = parseExcelBufferToDomainJson(
      Buffer.from(fileBuffer)
    );
    if (!result.success || !result.result) {
      console.error('Error processing no member country: ', result.error);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: result.error,
            errorCode: ERROR_CODES.UNKNOWN,
          },
        },
        { status: 400 }
      );
    }

    const domainDatas = result.result.domainDatas;

    const failures: string[] = [];
    const domains = await prisma.domain.findMany({
      include: {
        subsidiary: {
          include: {
            region: true,
          },
        },
      },
    });

    domainDatas.forEach(async (domainData) => {
      const domain = domains.find((d) => domainData.code === d.code);
      if (domain) {
        domainData.id = domain.id;
        if (domain.subsidiary?.regionId) {
          domainData.regionId = domain.subsidiary.regionId;
        }
        if (domain.subsidiaryId) {
          domainData.subsidiaryId = domain.subsidiaryId;
        }
      } else {
        failures.push('Domain not found: ' + domainData.code);
      }
    });

    const filteredDomainDatas = domainDatas.filter((domainData) => {
      return domainData.id !== '';
    });

    const domainIds = filteredDomainDatas.map((domainData) => domainData.id);
    const quizSets = await prisma.quizSet.findMany({
      where: {
        domainId: {
          in: domainIds,
        },
        campaignId: campaign.id,
      },
      include: {
        language: true,
      },
    });

    filteredDomainDatas.forEach((domainData) => {
      const quizSet = quizSets.find((q) => q.domainId === domainData.id);
      if (quizSet) {
        if (quizSet.language) {
          if (!domainData.languages) {
            domainData.languages = [];
          }
          domainData.languages.push(quizSet.language);
          domainData.isReady = true;
        }
      } else {
        domainData.isReady = false;
      }
    });

    // JSON 객체를 문자열로 변환 (예쁘게 출력)
    const jsonString = JSON.stringify(filteredDomainDatas, null, 2);
    // =============================================
    // file upload
    // =============================================

    // const file = files.file?.[0];
    const s3Client =
      process.env.ENV === 'local'
        ? new S3Client({
            region: process.env.ASSETS_S3_BUCKET_REGION,
            credentials: fromIni({
              profile: process.env.ASSETS_S3_BUCKET_PROFILE,
            }),
          })
        : new S3Client({
            region: process.env.ASSETS_S3_BUCKET_REGION,
          });

    // const fileBuffer = Buffer.from(await file.arrayBuffer());
    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:.Z]/g, '')
      .slice(0, 12); // YYYYMMDDHHMM 형식

    // 기존 파일명에서 모든 _YYYYMMDDHHMM 패턴 제거
    const baseFileName = file.name
      .replace(/(_\d{12})+/, '')
      .replace(/\.[^/.]+$/, '');
    const fileExtension = file.name.match(/\.[^/.]+$/)?.[0] || '';

    // 최종 파일명 생성 (중복된 날짜 제거 후 새 날짜 추가)
    const fileNameWithTimestamp = `${baseFileName}_${timestamp}${fileExtension}`;
    const destinationKey = `certification/${campaign.slug}/cms/upload/activityid/${fileNameWithTimestamp}`;

    const destinationKeyForWeb = `certification/${campaign.slug}/jsons/channels.json`;
    // 📌 S3 업로드 실행 (PutObjectCommand 사용)
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.ASSETS_S3_BUCKET_NAME,
        Key: destinationKeyForWeb,
        Body: jsonString,
      })
    );

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.ASSETS_S3_BUCKET_NAME,
        Key: destinationKey,
        Body: jsonString,
      })
    );

    if (uploadedFile) {
      uploadedFile = await prisma.uploadedFile.update({
        where: {
          id: uploadedFile.id,
        },
        data: {
          uploadedBy: sesstion?.user?.id,
          path: `/${destinationKey}`,
        },
      });
    } else {
      uploadedFile = await prisma.uploadedFile.create({
        data: {
          fileType: FileType.NON_SPLUS_DOMAINS,
          campaignId: campaign.id,
          uploadedBy: sesstion?.user?.id ?? '',
          path: `/${destinationKey}`,
        },
      });
    }

    async function invalidateCache(distributionId: string, paths: string[]) {
      try {
        const command = new CreateInvalidationCommand({
          DistributionId: distributionId,
          InvalidationBatch: {
            Paths: {
              Quantity: paths.length,
              Items: paths,
            },
            CallerReference: `${Date.now()}`, // 고유한 요청 ID (매번 다른 값 필요)
          },
        });

        const response = await cloudFrontClient.send(command);
        console.log('Invalidation successful:', response);
      } catch (error) {
        console.error('Error invalidating CloudFront cache:', error);
      }
    }

    const cloudFrontClient =
      process.env.ENV === 'local'
        ? new CloudFrontClient({
            region: 'us-east-1',
            credentials: fromIni({
              profile: process.env.ASSETS_S3_BUCKET_PROFILE,
            }),
          })
        : new CloudFrontClient({
            region: 'us-east-1',
          });

    // 사용 예제
    const distributionId: string = process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID!;
    const pathsToInvalidate = [
      `/certification/${campaign.slug}/jsons/channels.json`,
    ]; // 무효화할 경로

    invalidateCache(distributionId, pathsToInvalidate);

    return NextResponse.json(
      {
        success: true,
        result: {
          data: filteredDomainDatas,
          uploadedFile,
          failures,
        },
      },
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
  } finally {
    await prisma.$disconnect();
  }
}
