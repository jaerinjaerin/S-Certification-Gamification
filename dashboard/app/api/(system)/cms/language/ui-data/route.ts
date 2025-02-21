/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await prisma.$connect();

    return NextResponse.json({ success: true, result: {} }, { status: 200 });
  } catch (error: any) {
    console.error('Error Domain Data:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: 'Internal server error',
          details: error.message,
        },
      },
      { status: 500 }
    );
  } finally {
    prisma.$disconnect();
  }
}
