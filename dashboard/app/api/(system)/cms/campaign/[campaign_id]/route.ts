import { ERROR_CODES } from '@/app/constants/error-codes';
import { auth } from '@/auth';
import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Zod를 사용한 입력 데이터 검증
const editCampaignScheme = z.object({
  campaignId: z.string(),
  name: z.string(),
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

// 유틸 함수: null, undefined, false 값을 제거
const filterNullish = (obj: Record<string, any>) => {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
};

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const session = await auth();
  const validatedData = editCampaignScheme.parse(body);

  try {
    let campaign = await prisma.campaign.findFirst({
      where: {
        id: validatedData.campaignId,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: '캠페인 수정에 실패했습니다.',
          },
        },
        { status: 400 }
      );
    }

    // 이미 시작한 캠페인이면 수정 불가
    if (campaign.startedAt < new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: '이미 시작된 캠페인은 수정할 수 없습니다.',
          },
        },
        { status: 400 }
      );
    }

    // 업데이트할 데이터 필터링 (값이 있는 경우에만 업데이트)
    const campaignUpdateData = filterNullish({
      description: validatedData.description,
      name: validatedData.name,
      updaterId: session?.user?.id,
      startedAt: validatedData.startedAt
        ? new Date(validatedData.startedAt)
        : null,
      endedAt: validatedData.endedAt ? new Date(validatedData.endedAt) : null,
    });

    let updatedCampaign = campaign;
    if (Object.keys(campaignUpdateData).length > 0) {
      updatedCampaign = await prisma.campaign.update({
        where: { id: validatedData.campaignId },
        data: campaignUpdateData,
      });
    }

    // 캠페인 설정 업데이트 (필요한 값만 추출)
    const campaignSettingsData = filterNullish({
      totalStages: validatedData.totalStages,
      firstBadgeName: validatedData.firstBadgeName,
      secondBadgeName: validatedData.secondBadgeName,
      ffFirstBadgeStageIndex: validatedData.ffFirstBadgeStageIndex,
      ffSecondBadgeStageIndex: validatedData.ffSecondBadgeStageIndex,
      fsmFirstBadgeStageIndex: validatedData.fsmFirstBadgeStageIndex,
      fsmSecondBadgeStageIndex: validatedData.fsmSecondBadgeStageIndex,
    });

    let campaignSettings = null;
    if (Object.keys(campaignSettingsData).length > 0) {
      campaignSettings = await prisma.campaignSettings.findFirst({
        where: {
          campaignId: campaign.id,
        },
      });

      if (campaignSettings) {
        campaignSettings = await prisma.campaignSettings.update({
          where: { id: campaignSettings.id },
          data: campaignSettingsData,
        });
      } else {
        campaignSettings = await prisma.campaignSettings.create({
          data: {
            campaignId: campaign.id,
            ...campaignSettingsData,
          },
        });
      }
    }

    return NextResponse.json(
      { success: true, result: { campaign, campaignSettings } },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error create campaign: ', error);
    return NextResponse.json({ error: error }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

const deleteCampaignScheme = z.object({
  campaignId: z.string(),
});

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const validatedData = deleteCampaignScheme.parse(body);

  try {
    let campaign = await prisma.campaign.findFirst({
      where: {
        id: validatedData.campaignId,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: '캠페인 삭제에 실패했습니다.',
          },
        },
        { status: 400 }
      );
    }

    // 이미 시작한 캠페인이면 수정 불가
    if (campaign.startedAt < new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: '이미 시작된 캠페인은 삭제할 수 없습니다.',
          },
        },
        { status: 400 }
      );
    }

    await prisma.campaign.update({
      where: {
        id: campaign.id,
      },
      data: {
        deleted: true,
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error delete campaign: ', error);
    return NextResponse.json({ error: error }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

type Props = {
  params: {
    campaign_id: string;
  };
};

export async function GET(request: NextRequest, props: Props) {
  try {
    const campaignId = props.params.campaign_id;
    console.log('campaignId: ', campaignId);
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
      },
      include: {
        settings: true,
      },
    });

    return NextResponse.json(
      { success: true, result: { campaign } },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error get campaigns: ', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'An unexpected error occurred',
          code: ERROR_CODES.UNKNOWN,
        },
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
