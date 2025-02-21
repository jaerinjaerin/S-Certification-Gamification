import { prisma } from '@/model/prisma';
import { NextResponse } from 'next/server';

// 응답 타입 정의
interface ApiResponse<T> {
  success: boolean;
  result?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

// 성공 응답 생성 유틸리티 함수
function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    result: data,
  };
}

// 에러 응답 생성 유틸리티 함수
function createErrorResponse(
  code: string,
  message: string,
  details?: string
): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}

export async function GET() {
  try {
    const languages = await prisma.language.findMany();
    console.log('🥑 languages', languages);

    return NextResponse.json(createSuccessResponse(languages), { status: 200 });
  } catch (error) {
    console.error('Error Domain Data:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';

    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', errorMessage),
      { status: 500 }
    );
  }
}
