import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function GET() {
  try {
    const domainWebLanguages = await prisma.domainWebLanguage.findMany();
    return NextResponse.json(
      { success: true, result: { domainWebLanguages } },
      { status: 200 }
    );
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

const editParamScheme = z.object({
  domainId: z.string(),
  domainWebLanguageId: z.string(),
  languageId: z.string(),
});

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const validatedData = editParamScheme.parse(body);

  try {
    const domainWebLanguage = await prisma.domainWebLanguage.update({
      where: {
        id: validatedData.domainWebLanguageId,
      },
      data: {
        languageId: validatedData.languageId,
        domainId: validatedData.domainId,
      },
    });

    return NextResponse.json(
      { success: true, result: { domainWebLanguage } },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error create campaign: ', error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
