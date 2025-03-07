import { ERROR_CODES } from '@/app/constants/error-codes';
import { invalidateCache } from '@/lib/aws/cloudfront';
import { getS3Client } from '@/lib/aws/s3-client';
import { DomainData } from '@/lib/nomember-excel-parser';
import { prisma } from '@/model/prisma';
import { CloudFrontClient } from '@aws-sdk/client-cloudfront';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { fromIni } from '@aws-sdk/credential-provider-ini';
import { FileType } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { campaignId } = body;

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

    let uploadedFile = await prisma.uploadedFile.findFirst({
      where: {
        fileType: FileType.NON_SPLUS_DOMAINS,
        campaignId: campaign.id,
      },
    });

    if (!uploadedFile) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'No file uploaded',
            code: ERROR_CODES.NO_DATA_FOUND,
          },
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}${uploadedFile.path}`
    );
    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Failed to fetch uploaded file',
            code: ERROR_CODES.UNKNOWN,
          },
        },
        { status: 500 }
      );
    }
    const domainDatas = await response.json();

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

    domainDatas.forEach(async (domainData: any) => {
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

    const filteredDomainDatas = domainDatas.filter((domainData: any) => {
      return domainData.id !== '';
    });

    const domainIds = filteredDomainDatas.map(
      (domainData: any) => domainData.id
    );
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

    filteredDomainDatas.forEach((domainData: DomainData) => {
      const quizSet = quizSets.find((q) => q.domainId === domainData.id);
      if (quizSet) {
        if (quizSet.language) {
          // if (!domainData.languages) {
          //   domainData.languages = [];
          // }
          // domainData.languages.push(quizSet.language);
          if (quizSet.jobCodes[0].toLowerCase() === 'ff') {
            if (!domainData.languages.ff) {
              domainData.languages.ff = [];
            }
            domainData.languages.ff.push(quizSet.language);
          }
          if (quizSet.jobCodes[0].toLowerCase() === 'fsm') {
            if (!domainData.languages.fsm) {
              domainData.languages.fsm = [];
            }
            domainData.languages.fsm.push(quizSet.language);
          }

          domainData.isReady = true;
        } else {
          domainData.isReady = false;
        }
      } else {
        domainData.isReady = false;
      }
    });

    // JSON 객체를 문자열로 변환
    const jsonString = JSON.stringify(filteredDomainDatas, null, 2);
    // =============================================
    // file upload
    // =============================================

    const s3Client = getS3Client();

    const destinationKeyForWeb = `certification/${campaign.slug}/jsons/channels.json`;
    // 📌 S3 업로드 실행 (PutObjectCommand 사용)
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.ASSETS_S3_BUCKET_NAME,
        Key: destinationKeyForWeb,
        Body: jsonString,
      })
    );

    // async function invalidateCache(distributionId: string, paths: string[]) {
    //   try {
    //     const command = new CreateInvalidationCommand({
    //       DistributionId: distributionId,
    //       InvalidationBatch: {
    //         Paths: {
    //           Quantity: paths.length,
    //           Items: paths,
    //         },
    //         CallerReference: `${Date.now()}`, // 고유한 요청 ID (매번 다른 값 필요)
    //       },
    //     });

    //     const response = await cloudFrontClient.send(command);
    //     console.log('Invalidation successful:', response);
    //   } catch (error) {
    //     console.error('Error invalidating CloudFront cache:', error);
    //   }
    // }

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
