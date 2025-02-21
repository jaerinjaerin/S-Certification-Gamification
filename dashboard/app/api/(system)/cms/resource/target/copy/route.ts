import { prisma } from '@/model/prisma';
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
        id: validatedData.sourceCampaignId,
      },
    });

    if (!destinationCampaign) {
      console.log('대상 캠페인을 찾을 수 없습니다.');
      return NextResponse.json(
        {
          success: false,
          error: {
            message: '대상 캠페인을 찾을 수 없습니다',
          },
        },
        { status: 400 }
      );
    }

    const domainGoals = await prisma.domainGoal.findMany({
      where: {
        campaignId: soruceCampaign.id,
      },
    });
    for (const domainGoal of domainGoals) {
      await prisma.domainGoal.create({
        data: {
          campaignId: destinationCampaign.id,
          ff: domainGoal.ff,
          fsm: domainGoal.fsm,
          ffSes: domainGoal.ffSes,
          fsmSes: domainGoal.fsmSes,
          domainId: domainGoal.domainId,
          regionId: domainGoal.regionId,
          subsidiaryId: domainGoal.subsidiaryId,
        },
      });
    }

    console.log('데이타 생성 완료');

    return NextResponse.json({ success: true, result: {} }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error create campaign: ', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: '이미지 복사 중 오류가 발생했습니다.',
        },
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
