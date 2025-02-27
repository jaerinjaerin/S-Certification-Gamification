import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Zod를 사용한 입력 데이터 검증
const editCampaignScheme = z.object({
  description: z.string(),
  startedAt: z.string(),
  endedAt: z.string(),
  userId: z.string(),
});

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const validatedData = editCampaignScheme.parse(body);

  try {
    const campaign = await prisma.campaign.findFirst({
      where: {
        description: validatedData.description,
        updaterId: validatedData.userId,
        startedAt: new Date(validatedData.startedAt),
        endedAt: new Date(validatedData.endedAt),
      },
    });

    return NextResponse.json(
      { success: true, result: { campaign } },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error create campaign: ', error);
    return NextResponse.json({ error: error }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
