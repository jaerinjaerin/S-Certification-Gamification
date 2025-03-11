import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const deleteQuizSetScheme = z.object({
  quizsetId: z.string(),
});

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const validatedData = deleteQuizSetScheme.parse(body);

  try {
    let quizSet = await prisma.quizSet.findFirst({
      where: {
        id: validatedData.quizsetId,
      },
    });

    if (!quizSet) {
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

    await prisma.quizSet.delete({
      where: {
        id: quizSet.id,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error delete quizset: ', error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

type Props = {
  params: {
    quizset_id: string;
  };
};

export async function GET(request: NextRequest, props: Props) {
  try {
    const quizSetId = props.params.quizset_id;
    const quizSet = await prisma.quizSet.findFirst({
      where: {
        id: quizSetId,
      },
      include: {
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

    if (!quizSet) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: '캠페인을 찾을 수 없습니다.',
          },
        },
        { status: 404 }
      );
    }

    const quizSetFile = await prisma.quizSetFile.findFirst({
      where: {
        quizSetId: quizSet.id,
        campaignId: quizSet.campaignId,
        // languageId: quizSet.languageId,
        // domainId: quizSet.domainId,
      },
    });

    return NextResponse.json(
      { success: true, result: { quizSet, quizSetFile } },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error get quizset: ', error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
