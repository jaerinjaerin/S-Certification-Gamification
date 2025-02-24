/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { getPath } from '@/lib/file';
import { getFromS3, uploadToS3 } from '@/lib/s3-client';
import { extractLanguageCode } from '@/lib/text';
import { prisma } from '@/model/prisma';
import { Campaign } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const campaign = searchParams.get('campaignName') as string;

    await prisma.$connect();

    const languages = await prisma.language.findMany({});

    const campaignName = (campaign || 'unknown').toLowerCase();
    const path = getPath(campaignName, 'ui_language');

    const result = await Promise.all(
      languages.map(async (language: LanguageProps) => {
        let urls: { excelUrl?: string; jsonUrl?: string } = {
          excelUrl: undefined,
          jsonUrl: undefined,
        };
        const dir = `${path}/ui_${language.code}`;
        // 엑셀만 체크
        const response = await getFromS3({
          key: `${dir}.xlsx`,
          isNoCache: true,
        });
        if (response) {
          urls = {
            excelUrl: `/${dir}.xlsx`,
            jsonUrl: `/${dir}.json`,
          };
        }

        return { ...language, ...urls };
      })
    );

    return NextResponse.json({ success: true, result }, { status: 200 });
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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const jsons = formData.getAll('jsons') as File[];
    const campaign = JSON.parse(formData.get('campaign') as string) as Campaign;

    if (!files || !jsons) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    await prisma.$connect();

    const codes = files
      .map((file) => extractLanguageCode(file.name))
      .filter(Boolean) as string[];

    const languages = await prisma.language.findMany({
      where: { code: { in: codes } },
    });

    const campaignName = (campaign.name || 'unknown').toLowerCase();
    const path = getPath(campaignName, 'ui_language');
    // excel 파일 업로드
    await Promise.all(
      files.map((file) => {
        const code = extractLanguageCode(file.name);
        if (!code) {
          return Promise.resolve(null);
        }

        const key = `${path}/ui_${code}.xlsx`;
        return uploadToS3({ key, file, isNoCache: true });
      })
    );

    //
    // json 파일 업로드
    await Promise.all(
      jsons.map((file) => {
        const code = extractLanguageCode(file.name);
        if (!code) {
          return Promise.resolve(null);
        }

        const key = `${path}/ui_${code}.json`;
        return uploadToS3({ key, file, isNoCache: true });
      })
    );

    const result = languages.map((language) => {
      return {
        id: language.id,
        name: language.name,
        code: language.code,
        jsonUrl: `/${path}/ui_${language.code}.json`,
        excelUrl: `/${path}/ui_${language.code}.xlsx`,
      };
    });

    return NextResponse.json({ success: true, result }, { status: 200 });
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
