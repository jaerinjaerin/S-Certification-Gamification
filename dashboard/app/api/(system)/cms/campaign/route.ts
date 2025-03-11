import { ERROR_CODES } from '@/app/constants/error-codes';
import { auth } from '@/auth';
import { prisma } from '@/model/prisma';
import { containsBannedWords } from '@/utils/slug';
import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Zod를 사용한 입력 데이터 검증
const createCampaignScheme = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  startedAt: z.string(),
  endedAt: z.string(),
  totalStages: z.number(),
  firstBadgeName: z.string().optional().nullable(),
  secondBadgeName: z.string().optional().nullable(),
  ffFirstBadgeStageIndex: z.number().optional().nullable(),
  ffSecondBadgeStageIndex: z.number().optional().nullable(),
  fsmFirstBadgeStageIndex: z.number().optional().nullable(),
  fsmSecondBadgeStageIndex: z.number().optional().nullable(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validatedData = createCampaignScheme.parse(body);

  const session = await auth();

  try {
    if (containsBannedWords(validatedData.slug)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Slug contains banned words',
            code: ERROR_CODES.INVALID_PARAMETER,
          },
        },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaign.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        createrId: session?.user?.id ?? '',
        updaterId: session?.user?.id,
        startedAt: new Date(validatedData.startedAt),
        endedAt: new Date(validatedData.endedAt),
      },
    });

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: '캠페인 생성에 실패했습니다.',
          },
        },
        { status: 400 }
      );
    }

    // const campaignSettings = await prisma.campaignSettings.create({
    //   data: {
    //     campaignId: campaign.id,
    //     totalStages: validatedData.totalStages,
    //     firstBadgeName: validatedData.firstBadgeName,
    //     secondBadgeName: validatedData.secondBadgeName,
    //     ffFirstBadgeStageIndex: validatedData.ffFirstBadgeStageIndex,
    //     ffSecondBadgeStageIndex: validatedData.ffSecondBadgeStageIndex,
    //     fsmFirstBadgeStageIndex: validatedData.fsmFirstBadgeStageIndex,
    //     fsmSecondBadgeStageIndex: validatedData.fsmSecondBadgeStageIndex,
    //   },
    // });

    const filterNullish = (obj: Record<string, any>) => {
      return Object.fromEntries(
        Object.entries(obj).filter(([_, v]) => v != null)
      );
    };

    const campaignSettingsData = filterNullish({
      totalStages: validatedData.totalStages,
      firstBadgeName: validatedData.firstBadgeName,
      secondBadgeName: validatedData.secondBadgeName,
      ffFirstBadgeStageIndex: validatedData.ffFirstBadgeStageIndex,
      ffSecondBadgeStageIndex: validatedData.ffSecondBadgeStageIndex,
      fsmFirstBadgeStageIndex: validatedData.fsmFirstBadgeStageIndex,
      fsmSecondBadgeStageIndex: validatedData.fsmSecondBadgeStageIndex,
    });

    // console.log('campaignSettingsData: ', campaignSettingsData);

    // campaignSettingsData에 값이 있는 경우에만 생성
    const campaignSettings = await prisma.campaignSettings.create({
      data: {
        campaignId: campaign.id, // 필수 값
        ...campaignSettingsData, // 옵션 값 (값이 있는 경우만)
        // totalStages: validatedData.totalStages,
        // firstBadgeName: validatedData.firstBadgeName,
        // secondBadgeName: validatedData.secondBadgeName,
        // ffFirstBadgeStageIndex: validatedData.ffFirstBadgeStageIndex,
        // ffSecondBadgeStageIndex: validatedData.ffSecondBadgeStageIndex,
        // fsmFirstBadgeStageIndex: validatedData.fsmFirstBadgeStageIndex,
        // fsmSecondBadgeStageIndex: validatedData.fsmSecondBadgeStageIndex,
      },
    });

    const contentCopyHistory = await prisma.contentCopyHistory.create({
      data: {
        campaignId: campaign.id,
      },
    });

    await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        settingsId: campaignSettings.id,
        contentCopyHistoryId: contentCopyHistory.id,
      },
    });

    return NextResponse.json(
      { success: true, result: { campaign, campaignSettings } },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error create campaign: ', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: '캠페인 생성에 실패했습니다.',
          code: ERROR_CODES.UNKNOWN,
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const role = searchParams.get('role') as string;

    let where = {} as Prisma.CampaignWhereInput;
    if (role !== 'ADMIN') {
      const roles = await prisma.role.findUnique({
        where: { id: role },
        include: {
          permissions: {
            select: { permission: { select: { domains: true } } },
          },
        },
      });

      let domainIds: string[] = [];
      if (roles) {
        domainIds = roles.permissions.flatMap((p) =>
          p.permission.domains.map((d) => d.id)
        );
      }

      where = {
        quizSets: { some: { domain: { id: { in: domainIds } } } },
        deleted: false,
      };
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      include: { settings: true },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(
      { success: true, result: { campaigns } },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error get campaigns: ', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: '캠페인 목록을 불러오는 중 오류가 발생했습니다.',
          code: ERROR_CODES.UNKNOWN,
        },
      },
      { status: 500 }
    );
  }
}
