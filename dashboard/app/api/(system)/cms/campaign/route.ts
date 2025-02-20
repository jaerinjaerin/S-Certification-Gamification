import { auth } from '@/auth';
import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Zod를 사용한 입력 데이터 검증
const createCampaignScheme = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  startedAt: z.string(),
  endedAt: z.string(),
  totalStages: z.number(),
  firstBadgeName: z.string().optional(),
  secondBadgeName: z.string().optional(),
  ffFirstBadgeStageIndex: z.number().optional(),
  ffSecondBadgeStageIndex: z.number().optional(),
  fsmFirstBadgeStageIndex: z.number().optional(),
  fsmSecondBadgeStageIndex: z.number().optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validatedData = createCampaignScheme.parse(body);

  const sesstion = await auth();

  try {
    const campaign = await prisma.campaign.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        createrId: sesstion?.user?.id ?? '',
        updaterId: sesstion?.user?.id,
        startedAt: new Date(validatedData.startedAt),
        endedAt: new Date(validatedData.endedAt),
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign already exists' },
        { status: 400 }
      );
    }

    const campaignSettings = await prisma.campaignSettings.create({
      data: {
        campaignId: campaign.id,
        totalStages: validatedData.totalStages,
        firstBadgeName: validatedData.firstBadgeName,
        secondBadgeName: validatedData.secondBadgeName,
        ffFirstBadgeStageIndex: validatedData.ffFirstBadgeStageIndex,
        ffSecondBadgeStageIndex: validatedData.ffSecondBadgeStageIndex,
        fsmFirstBadgeStageIndex: validatedData.fsmFirstBadgeStageIndex,
        fsmSecondBadgeStageIndex: validatedData.fsmSecondBadgeStageIndex,
      },
    });

    return NextResponse.json({ campaign, campaignSettings }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error create campaign: ', error);
    return NextResponse.json({ error: error }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany();

    return NextResponse.json({ campaigns }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error get campaigns: ', error);
    return NextResponse.json({ error: error }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
