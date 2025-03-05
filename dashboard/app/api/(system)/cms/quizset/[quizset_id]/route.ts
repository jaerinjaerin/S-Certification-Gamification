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
