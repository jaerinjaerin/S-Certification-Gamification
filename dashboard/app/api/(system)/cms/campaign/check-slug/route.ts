import { ERROR_CODES } from '@/app/constants/error-codes';
import { prisma } from '@/model/prisma';
import { containsBannedWords } from '@/utils/slug';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const slug = searchParams.get('slug') as string;
    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Missing required parameter: slug',
            code: ERROR_CODES.MISSING_REQUIRED_PARAMETER,
          },
        },
        { status: 400 }
      );
    }

    if (containsBannedWords(slug)) {
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

    const campaign = await prisma.campaign.findFirst({
      where: {
        slug,
      },
    });

    return NextResponse.json(
      { success: true, result: { available: campaign ? false : true } },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error check campaign slug: ', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Unknown error',
          code: ERROR_CODES.UNKNOWN,
        },
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
