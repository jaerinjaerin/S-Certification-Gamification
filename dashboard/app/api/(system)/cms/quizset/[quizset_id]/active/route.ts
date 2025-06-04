import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';

import { z } from 'zod';

const apiBodySchema = z.object({
  quizSetId: z.string(),
  active: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quizSetId, active } = apiBodySchema.parse(body);

    const quizSet = await prisma.quizSet.update({
      where: { id: quizSetId },
      data: {
        active,
      },
    });

    console.log(
      `QuizSet ${active} -> ${quizSet.active} active status updated to ${active}`
    );

    return NextResponse.json(
      {
        success: true,
        result: quizSet,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      'Error in POST /api/(system)/cms/quizset/[quizset_id]/active:',
      error
    );
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
