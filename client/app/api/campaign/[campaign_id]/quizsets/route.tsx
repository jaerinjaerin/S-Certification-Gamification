// pages/api/quiz.js
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

type Context = {
  params: { campaign_id: string };
};

export async function GET(request: NextRequest, context: Context) {
  const params = await context.params;
  const campaignId = params.campaign_id;
  const searchParams = new URL(request.url).searchParams;

  const userId = searchParams.get('userId');
  const metadataId = searchParams.get('metadataId');

  if (!userId || !campaignId || !metadataId) {
    return NextResponse.json(
      {
        status: 400,
        message: 'Missing required parameters',
        error: {
          code: 'BAD_REQUEST',
          details: 'userId, campaignId, and metadataId are required',
        },
      },
      { status: 400 }
    );
  }

  try {
    // 유저의 UserQuizHistory를 가져옴
    const userQuizHistory = await prisma.userQuizHistory.findFirst({
      where: {
        userId,
        campaignId: campaignId,
        metadataId: metadataId,
      },
    });

    console.log('userQuizHistory:', userQuizHistory);

    // 해당 campaignId와 metadataId에 맞는 QuizSet 목록을 stage로 정렬하여 가져옴
    const quizSets = await prisma.quizSet.findMany({
      where: {
        campaignId: campaignId,
        metadataId: metadataId,
        // metadata: {
        //   id: metadataId,
        //   // campaignId: campaignId,
        // },
      },
      orderBy: {
        stage: 'asc',
      },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    console.log('quizSets:', quizSets);

    return NextResponse.json(
      {
        status: 200,
        message: 'Quiz data retrieved successfully',
        data: {
          userQuizHistory,
          quizSets,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching quiz data:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';

    return NextResponse.json(
      {
        status: 500,
        message: 'Internal server error',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          details: errorMessage,
        },
      },
      { status: 500 }
    );
  }
}
