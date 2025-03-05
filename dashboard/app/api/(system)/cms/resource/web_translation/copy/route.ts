import { ERROR_CODES } from '@/app/constants/error-codes';
import { prisma } from '@/model/prisma';
import {
  CopyObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3';
import { fromIni } from '@aws-sdk/credential-provider-ini';
import { FileType } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Zod를 사용한 입력 데이터 검증
const copyResourceScheme = z.object({
  sourceCampaignId: z.string(),
  destinationCampaignId: z.string(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validatedData = copyResourceScheme.parse(body);

  try {
    const soruceCampaign = await prisma.campaign.findFirst({
      where: {
        id: validatedData.sourceCampaignId,
      },
    });

    if (!soruceCampaign) {
      console.log('원본 캠페인을 찾을 수 없습니다.');
      return NextResponse.json(
        {
          success: false,
          error: {
            message: '원본 캠페인을 찾을 수 없습니다.',
          },
        },
        { status: 400 }
      );
    }

    const destinationCampaign = await prisma.campaign.findFirst({
      where: {
        id: validatedData.destinationCampaignId,
      },
    });

    if (!destinationCampaign) {
      console.log('대상 캠페인을 찾을 수 없습니다.');
      return NextResponse.json(
        {
          success: false,
          error: {
            message: '대상 캠페인을 찾을 수 없습니다.',
          },
        },
        { status: 400 }
      );
    }

    // console.log('validatedData: ', validatedData);
    console.log('process.env.ENV: ', process.env.ENV);
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

    const bucketName = process.env.ASSETS_S3_BUCKET_NAME;
    const sourcePrefix = `certification/${soruceCampaign.slug}/messages/`; // 원본 디렉토리
    const destinationPrefix = `certification/${destinationCampaign.slug}/messages/`; // 이동할 디렉토리

    // 1. 원본 디렉토리의 파일 목록 가져오기
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: sourcePrefix,
    });

    console.log('listCommand: ', listCommand);

    const { Contents } = await s3Client.send(listCommand);

    if (!Contents || Contents.length === 0) {
      console.log('이동할 파일이 없습니다.');
      return NextResponse.json(
        {
          success: false,
          error: {
            message: '이동할 파일이 없습니다.',
          },
        },
        { status: 400 }
      );
    }

    const destinationKeys = [];
    for (const file of Contents) {
      const sourceKey = file.Key;
      if (!sourceKey) {
        continue;
      }
      try {
        const destinationKey = sourceKey.replace(
          sourcePrefix,
          destinationPrefix
        ); // 대상 디렉토리로 변경

        console.log(`Moving ${sourceKey} -> ${destinationKey}`);

        // 2. 파일 복사
        await s3Client.send(
          new CopyObjectCommand({
            Bucket: bucketName,
            CopySource: `${bucketName}/${sourceKey}`,
            Key: destinationKey,
          })
        );

        destinationKeys.push(destinationKey);
      } catch (error: unknown) {
        console.error('Error copy images: ', error);
      }
    }

    for (const destinationKey of destinationKeys) {
      console.log(`destinationKey: ${destinationKey}`);
      const fileName = destinationKey.split('/').pop();
      const lanbguageCode = fileName?.split('.')[0];
      const language = await prisma.language.findFirst({
        where: {
          code: lanbguageCode,
        },
      });

      if (language) {
        await prisma.uploadedFile.create({
          data: {
            campaignId: destinationCampaign.id,
            languageId: language.id,
            path: `/${destinationKey}`,
            fileType: FileType.UI_LANGUAGE,
            uploadedBy: 'seed',
          },
        });
      }
    }

    console.log('파일 복사 완료');

    const domainWebLanguages = await prisma.domainWebLanguage.findMany({
      where: {
        campaignId: soruceCampaign.id,
      },
    });

    for (const domainWebLanguage of domainWebLanguages) {
      await prisma.domainWebLanguage.create({
        data: {
          campaignId: destinationCampaign.id,
          domainId: domainWebLanguage.domainId,
          languageId: domainWebLanguage.languageId,
        },
      });
    }

    console.log('데이타 생성 완료');

    return NextResponse.json({ success: true, result: {} }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error copy images: ', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: '이미지 복사 중 오류가 발생했습니다.',
          code: ERROR_CODES.UNKNOWN,
        },
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
