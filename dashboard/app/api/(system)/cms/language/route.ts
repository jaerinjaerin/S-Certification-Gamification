/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { getFromS3, uploadToS3 } from '@/lib/s3-client';
import { extractLanguageCode } from '@/lib/text';
import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';

const getPath = (folderName: string) => {
  return `certification/${folderName}/ui_language`;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const campaignId =
      searchParams.get('campaign') || 'ac2fb618-384f-41aa-ab06-51546aeacd32';

    await prisma.$connect();

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    const languages = await prisma.language.findMany({});

    const folderName = (campaign?.name || 'unknown').toLowerCase();
    const path = getPath(folderName);

    const result = await Promise.all(
      languages.map(async (language: LanguageProps) => {
        let urls: { excelUrl?: string; jsonUrl?: string } = {
          excelUrl: undefined,
          jsonUrl: undefined,
        };
        const key = `/${path}/ui_${language.code}`;
        const response = await getFromS3({ key, isNoCache: true });
        if (response) {
          urls = {
            excelUrl: `${key}.xlsx`,
            jsonUrl: `${key}.json`,
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
    const campaignId = formData.get('campaign') as string;

    if (!files || !jsons) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    await prisma.$connect();

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });
    //

    const codes = files
      .map((file) => extractLanguageCode(file.name))
      .filter(Boolean) as string[];
    const languages = await prisma.language.findMany({
      where: { code: { in: codes } },
    });

    const folderName = (campaign?.name || 'unknown').toLowerCase();
    const path = getPath(folderName);
    // excel 파일 업로드
    await Promise.all(
      files.map((file) => {
        const code = extractLanguageCode(file.name);
        const key = `${path}/ui_${code}.xlsx`;
        return uploadToS3({ key, file, isNoCache: true });
      })
    );
    //
    // json 파일 업로드
    await Promise.all(
      jsons.map((file) => {
        const code = extractLanguageCode(file.name);
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
