export const dynamic = "force-dynamic";

import {prisma} from '@/model/prisma';
import {NextRequest, NextResponse} from 'next/server';
import {querySearchParams} from '../../../_lib/query';

// UserQuizStatistics 중 isCompleted 기 true 인 유저

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const { where } = querySearchParams(searchParams);

    await prisma.$connect();

    const count = await prisma.userQuizBadgeStageStatistics.count({
      where: { ...where, quizStageIndex: 2 },
    });
    return NextResponse.json({ result: { count } });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    prisma.$disconnect();
  }
}
