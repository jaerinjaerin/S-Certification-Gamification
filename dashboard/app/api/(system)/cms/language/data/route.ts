/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getFromS3 } from '@/lib/s3-client';
import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const keys: string[] = [];
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith('keys.')) {
        keys.push(value);
      }
    }

    if (keys.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_KEYS', message: 'Keys are required' },
        },
        { status: 400 }
      );
    }

    const zip = new JSZip();

    // 병렬적으로 S3에서 파일 가져오기
    const filePromises = keys.map(async (key) => {
      try {
        const response = await getFromS3({ key, isNoCache: true });
        if (response?.Body) {
          const buffer = await response.Body.transformToByteArray();
          zip.file(key.split('/').pop() || 'file', buffer);
          return key;
        }
      } catch (error: any) {
        if (error.name !== 'NotFound') {
          console.error(`S3 파일 확인 실패: ${key}`, error);
        }
      }
      return null; // 유효하지 않은 파일은 제외
    });

    const validFiles = (await Promise.all(filePromises)).filter(Boolean); // 존재하는 파일만 필터링

    if (validFiles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_VALID_FILES',
            message: 'No valid files found in S3',
          },
        },
        { status: 404 }
      );
    }

    // ZIP 파일 생성
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename=ui-language-data.zip`,
      },
    });
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
  }
}
