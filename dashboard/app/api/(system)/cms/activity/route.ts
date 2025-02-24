import { ERROR_CODES } from '@/app/constants/error-codes';
import { auth } from '@/auth';
import {
  ActivityIdProcessResult,
  processActivityExcelBuffer,
} from '@/lib/activityid-excel-parser';
import { prisma } from '@/model/prisma';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { fromIni } from '@aws-sdk/credential-provider-ini';
import { BadgeType, FileType } from '@prisma/client';
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
        fileType: FileType.ACTIVITYID,
        campaignId: campaign.id,
      },
    });

    if (uploadedFile) {
      if (file.name !== uploadedFile.path.split('/').pop()) {
        console.error('Different file name');
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Different file name',
              errorCode: ERROR_CODES.FILE_NAME_MISMATCH,
            },
          },
          { status: 400 }
        );
      }
    }

    // const fileBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const result: ActivityIdProcessResult = processActivityExcelBuffer(
      Buffer.from(fileBuffer)
    );
    if (!result.success || !result.data) {
      console.error('Error processing activity id excel: ', result.error);
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

    const activityBadges = [];
    const errors = [];

    for (const data of result.data) {
      const domainCode = data.domainCode;
      const domain = await prisma.domain.findFirst({
        where: {
          code: domainCode,
        },
      });

      if (!domain) {
        errors.push({
          message: `Domain not found: ${domainCode}`,
          code: ERROR_CODES.DOMAIN_NOT_FOUND,
        });
        continue;
      }

      const languageCode = data.languageCode;
      const language = await prisma.language.findFirst({
        where: {
          code: languageCode,
        },
      });

      if (!language) {
        errors.push({
          message: `Language not found: ${languageCode}`,
          code: ERROR_CODES.LANGUAGE_NOT_FOUND,
        });
        continue;
      }

      if (data.FF_FirstActivityID) {
        const badgeImage = await prisma.quizBadge.findFirst({
          where: {
            name: data.FF_FirstBadgeImage,
          },
        });

        if (!badgeImage) {
          errors.push({
            message: `Badge image not found: ${data.domainCode}, ${data.FF_FirstBadgeImage}`,
            code: ERROR_CODES.BADGE_IMAGE_NOT_FOUND,
          });
          continue;
        }

        let activityBadge = await prisma.activityBadge.findFirst({
          where: {
            campaignId: campaignId,
            domainId: domain.id,
            languageId: language.id,
            jobCode: 'ff',
            badgeType: BadgeType.FIRST,
          },
        });

        if (!activityBadge) {
          activityBadge = await prisma.activityBadge.create({
            data: {
              activityId: data.FF_FirstActivityID,
              campaignId: campaignId,
              domainId: domain.id,
              languageId: language.id,
              jobCode: 'ff',
              badgeType: BadgeType.FIRST,
              badgeImageId: badgeImage.id,
            },
          });
        } else {
          activityBadge = await prisma.activityBadge.update({
            where: {
              id: activityBadge.id,
            },
            data: {
              activityId: data.FF_FirstActivityID,
              badgeImageId: badgeImage.id,
              languageId: language.id,
            },
          });
        }

        activityBadges.push(activityBadge);
      }

      if (data.FF_SecondActivityID) {
        const badgeImage = await prisma.quizBadge.findFirst({
          where: {
            name: data.FF_SecondBadgeImage,
          },
        });

        if (!badgeImage) {
          errors.push({
            message: `Badge image not found: ${data.domainCode}, ${data.FF_SecondBadgeImage}`,
            code: ERROR_CODES.BADGE_IMAGE_NOT_FOUND,
          });
          continue;
        }

        let activityBadge = await prisma.activityBadge.findFirst({
          where: {
            campaignId: campaignId,
            domainId: domain.id,
            languageId: language.id,
            jobCode: 'ff',
            badgeType: BadgeType.SECOND,
          },
        });

        if (!activityBadge) {
          activityBadge = await prisma.activityBadge.create({
            data: {
              activityId: data.FF_SecondActivityID,
              campaignId: campaignId,
              domainId: domain.id,
              languageId: language.id,
              jobCode: 'ff',
              badgeType: BadgeType.SECOND,
              badgeImageId: badgeImage.id,
            },
          });
        } else {
          activityBadge = await prisma.activityBadge.update({
            where: {
              id: activityBadge.id,
            },
            data: {
              activityId: data.FF_SecondActivityID,
              campaignId: campaignId,
              domainId: domain.id,
              languageId: language.id,
              jobCode: 'ff',
              badgeType: BadgeType.SECOND,
              badgeImageId: badgeImage.id,
            },
          });
        }

        activityBadges.push(activityBadge);
      }

      if (data.FSM_FirstActivityID) {
        const badgeImage = await prisma.quizBadge.findFirst({
          where: {
            name: data.FSM_FirstBadgeImage,
          },
        });

        if (!badgeImage) {
          errors.push({
            message: `Badge image not found: ${data.domainCode}, ${data.FSM_FirstBadgeImage}`,
            code: ERROR_CODES.BADGE_IMAGE_NOT_FOUND,
          });
          continue;
        }

        let activityBadge = await prisma.activityBadge.findFirst({
          where: {
            campaignId: campaignId,
            domainId: domain.id,
            languageId: language.id,
            jobCode: 'fsm',
            badgeType: BadgeType.FIRST,
          },
        });

        if (!activityBadge) {
          activityBadge = await prisma.activityBadge.create({
            data: {
              activityId: data.FSM_FirstActivityID,
              campaignId: campaignId,
              domainId: domain.id,
              languageId: language.id,
              jobCode: 'fsm',
              badgeType: BadgeType.FIRST,
              badgeImageId: badgeImage.id,
            },
          });
        } else {
          activityBadge = await prisma.activityBadge.update({
            where: {
              id: activityBadge.id,
            },
            data: {
              activityId: data.FSM_FirstActivityID,
              campaignId: campaignId,
              domainId: domain.id,
              languageId: language.id,
              jobCode: 'fsm',
              badgeType: BadgeType.FIRST,
              badgeImageId: badgeImage.id,
            },
          });
        }

        activityBadges.push(activityBadge);
      }

      if (data.FSM_SecondActivityID) {
        const badgeImage = await prisma.quizBadge.findFirst({
          where: {
            name: data.FSM_SecondBadgeImage,
          },
        });

        if (!badgeImage) {
          errors.push({
            message: `Badge image not found: ${data.domainCode}, ${data.FSM_SecondBadgeImage}`,
            code: ERROR_CODES.BADGE_IMAGE_NOT_FOUND,
          });
          continue;
        }

        let activityBadge = await prisma.activityBadge.findFirst({
          where: {
            campaignId: campaignId,
            domainId: domain.id,
            languageId: language.id,
            jobCode: 'fsm',
            badgeType: BadgeType.SECOND,
            badgeImageId: badgeImage.id,
          },
        });

        if (!activityBadge) {
          activityBadge = await prisma.activityBadge.create({
            data: {
              activityId: data.FSM_SecondActivityID,
              campaignId: campaignId,
              domainId: domain.id,
              languageId: language.id,
              jobCode: 'fsm',
              badgeType: BadgeType.SECOND,
              badgeImageId: badgeImage.id,
            },
          });
        } else {
          activityBadge = await prisma.activityBadge.update({
            where: {
              id: activityBadge.id,
            },
            data: {
              activityId: data.FSM_SecondActivityID,
              campaignId: campaignId,
              domainId: domain.id,
              languageId: language.id,
              jobCode: 'fsm',
              badgeType: BadgeType.SECOND,
              badgeImageId: badgeImage.id,
            },
          });
        }

        activityBadges.push(activityBadge);
      }
    }

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
    // 📌 S3 업로드 실행 (PutObjectCommand 사용)
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.ASSETS_S3_BUCKET_NAME,
        Key: destinationKey,
        Body: fileBuffer,
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
          fileType: FileType.ACTIVITYID,
          campaignId: campaign.id,
          uploadedBy: sesstion?.user?.id ?? '',
          path: `/${destinationKey}`,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        result: {
          activityBadges,
          uploadedFile,
          errors,
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
  // });
}

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

    const quizSets = await prisma.quizSet.findMany({
      where: {
        campaignId: campaignId,
      },
      include: {
        domain: {
          include: {
            subsidiary: {
              include: {
                region: true,
              },
            },
          },
        },
        language: true,
        quizStages: {
          include: {
            badgeImage: true,
            questions: {
              orderBy: {
                order: 'asc',
              },
              include: {
                options: {
                  orderBy: {
                    order: 'asc',
                  },
                },
                backgroundImage: true,
                characterImage: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    const quizSetFiles = await prisma.quizSetFile.findMany({
      where: {
        campaignId: campaignId,
      },
    });

    const groupedQuizSets = quizSets.map((quizSet) => ({
      quizSet,
      quizSetFile: quizSetFiles
        .filter((file) => file.quizSetId === quizSet.id)
        .sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1))[0],
    }));

    console.log('groupedQuizSets: ', groupedQuizSets);

    return NextResponse.json(
      { success: true, groupedQuizSets },
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
