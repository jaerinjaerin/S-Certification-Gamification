import { ERROR_CODES } from '@/app/constants/error-codes';
import { prisma } from '@/model/prisma';
import {
  CopyObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3';
import { fromIni } from '@aws-sdk/credential-provider-ini';
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

  console.log('COPY');

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
    const sourcePrefix = `certification/${soruceCampaign.slug}/images/`; // 원본 디렉토리
    const destinationPrefix = `certification/${destinationCampaign.slug}/images/`; // 이동할 디렉토리

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

        // console.log(`Moving ${sourceKey} -> ${destinationKey}`);

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

    console.log('파일 복사 완료');

    const images = await prisma.image.findMany({
      where: {
        campaignId: soruceCampaign.id,
      },
    });

    const quizBadges = await prisma.quizBadge.findMany({
      where: {
        campaignId: soruceCampaign.id,
      },
    });

    // 초기에 중복으로 저장된 이미지가 있어서 중복 제거
    const uniqueImagesCharacters = Array.from(
      new Map(
        images
          .filter((image) => image.alt === 'character')
          .map((image) => [image.title, image])
      ).values()
    );

    // 초기에 중복으로 저장된 이미지가 있어서 중복 제거
    const uniqueImagesBackgrounds = Array.from(
      new Map(
        images
          .filter((image) => image.alt === 'background')
          .map((image) => [image.title, image])
      ).values()
    );

    // 초기에 중복으로 저장된 이미지가 있어서 중복 제거
    const uniqueQuizBadges = Array.from(
      new Map(quizBadges.map((badge) => [badge.name, badge])).values()
    );

    console.log('uniqueQuizBadges: ', uniqueQuizBadges);

    for (const image of uniqueImagesCharacters) {
      const destinationKey = destinationKeys.find((key) => {
        const fileName = key.split('/').pop();
        if (image.imagePath.includes('images/character/')) {
          return image.imagePath.split('/').pop() === fileName;
        }
      });

      if (destinationKey) {
        await prisma.image.create({
          data: {
            campaignId: destinationCampaign.id,
            imagePath: `/${destinationKey}`,
            alt: image.alt,
            title: image.title,
            caption: image.caption,
            format: image.format,
            thumbnailPath: image.thumbnailPath,
            domainId: image.domainId,
          },
        });
      }
    }

    for (const image of uniqueImagesBackgrounds) {
      const destinationKey = destinationKeys.find((key) => {
        const fileName = key.split('/').pop();
        if (image.imagePath.includes('images/background/')) {
          return image.imagePath.split('/').pop() === fileName;
        }
      });

      if (destinationKey) {
        await prisma.image.create({
          data: {
            campaignId: destinationCampaign.id,
            imagePath: `/${destinationKey}`,
            alt: image.alt,
            title: image.title,
            caption: image.caption,
            format: image.format,
            thumbnailPath: image.thumbnailPath,
            domainId: image.domainId,
          },
        });
      }
    }

    for (const image of uniqueQuizBadges) {
      const destinationKey = destinationKeys.find((key) => {
        const fileName = key.split('/').pop();
        if (image.imagePath.includes('images/badge/')) {
          return image.imagePath.split('/').pop() === fileName;
        }
      });

      if (destinationKey) {
        await prisma.quizBadge.create({
          data: {
            campaignId: destinationCampaign.id,
            imagePath: `/${destinationKey}`,
            name: image.name,
            description: image.description,
            domainId: image.domainId,
          },
        });
      }
    }

    // const uniqueDestinationKeys = Array.from(
    //   new Map(destinationKeys.map((key) => [key, key])).values()
    // );

    // for (const destinationKey of uniqueDestinationKeys) {
    //   const fileName = destinationKey.split('/').pop();

    //   // 캐릭터 이미지 저장
    //   const sourceCharacterImageIndex = uniqueImagesCharacter.findIndex(
    //     (image) =>
    //       image.imagePath.includes('images/character/') &&
    //       image.imagePath.split('/').pop() === fileName
    //   );

    //   if (sourceCharacterImageIndex !== -1) {
    //     const sourceCharacterImage =
    //       uniqueImagesCharacter[sourceCharacterImageIndex];
    //     uniqueImagesCharacter.splice(sourceCharacterImageIndex, 1); // 찾은 항목 삭제

    //     await prisma.image.create({
    //       data: {
    //         campaignId: destinationCampaign.id,
    //         imagePath: `/${destinationKey}`,
    //         alt: sourceCharacterImage.alt,
    //         title: sourceCharacterImage.title,
    //         caption: sourceCharacterImage.caption,
    //         format: sourceCharacterImage.format,
    //         thumbnailPath: sourceCharacterImage.thumbnailPath,
    //         domainId: sourceCharacterImage.domainId,
    //       },
    //     });
    //   }

    //   // 백그라운드 이미지 저장
    //   const sourceBackgroundImageIndex = uniqueImagesBackground.findIndex(
    //     (image) =>
    //       image.imagePath.includes('images/background/') &&
    //       image.imagePath.split('/').pop() === fileName
    //   );

    //   // console.log('sourceImage: ', sourceBackgroundImage, `/${destinationKey}`);
    //   if (sourceBackgroundImageIndex !== -1) {
    //     const sourceBackgroundImage =
    //       uniqueImagesBackground[sourceBackgroundImageIndex];
    //     uniqueImagesBackground.splice(sourceBackgroundImageIndex, 1); // 찾은 항목 삭제

    //     await prisma.image.create({
    //       data: {
    //         campaignId: destinationCampaign.id,
    //         imagePath: `/${destinationKey}`,
    //         alt: sourceBackgroundImage.alt,
    //         title: sourceBackgroundImage.title,
    //         caption: sourceBackgroundImage.caption,
    //         format: sourceBackgroundImage.format,
    //         thumbnailPath: sourceBackgroundImage.thumbnailPath,
    //         domainId: sourceBackgroundImage.domainId,
    //       },
    //     });
    //   }

    //   // 퀴즈 배지 저장
    //   const sourceQuizBadgeIndex = uniqueQuizBadges.findIndex(
    //     (badge) =>
    //       badge.imagePath.includes('images/badge/') &&
    //       badge.imagePath.split('/').pop() === fileName
    //   );

    //   console.log('uniqueQuizBadges', uniqueQuizBadges);
    //   console.log('sourceImage: ', sourceQuizBadgeIndex, `/${destinationKey}`);

    //   if (sourceQuizBadgeIndex !== -1) {
    //     const sourceQuizBadge = uniqueQuizBadges[sourceQuizBadgeIndex];
    //     uniqueQuizBadges.splice(sourceQuizBadgeIndex, 1); // 찾은 항목 삭제

    //     await prisma.quizBadge.create({
    //       data: {
    //         campaignId: destinationCampaign.id,
    //         imagePath: `/${destinationKey}`,
    //         name: sourceQuizBadge.name,
    //         description: sourceQuizBadge.description,
    //         domainId: sourceQuizBadge.domainId,
    //       },
    //     });
    //   }
    // }

    console.log('데이타 생성 완료');

    const contentCopyHistory = await prisma.contentCopyHistory.findFirst({
      where: {
        campaignId: destinationCampaign.id,
      },
    });
    if (contentCopyHistory) {
      await prisma.contentCopyHistory.update({
        where: {
          id: contentCopyHistory.id,
        },
        data: {
          imageCampaignId: validatedData.sourceCampaignId,
          imageCampaignName: soruceCampaign.name,
        },
      });
    }

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
