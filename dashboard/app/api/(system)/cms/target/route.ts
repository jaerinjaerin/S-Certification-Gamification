/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { getPath } from '@/lib/file';
import { uploadToS3 } from '@/lib/s3-client';
import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const campaignId = (searchParams.get('campaign') ||
      'ac2fb618-384f-41aa-ab06-51546aeacd32') as string;

    await prisma.$connect();

    const goals = await prisma.domainGoal.findMany({
      where: { campaignId },
    });
    const domains = await prisma.domain.findMany({});

    const goalMap = new Map(goals.map((g) => [g.domainId, g]));
    const result = domains.map((domain) => {
      const goal = goalMap.get(domain.id);
      const { id, ff, ffSes, fsm, fsmSes } = goal || {
        ff: 0,
        ffSes: 0,
        fsm: 0,
        fsmSes: 0,
      };
      const total = ff + ffSes + fsm + fsmSes;
      return {
        id,
        domain: domain.name,
        total,
        ff,
        ffSes,
        fsm,
        fsmSes,
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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const json = JSON.parse(
      formData.get('json') as string
    ) as TargetFromExcelProps[];
    const campaignId = (formData.get('campaign') ||
      'ac2fb618-384f-41aa-ab06-51546aeacd32') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    await prisma.$connect();

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });
    //
    // excel 파일 업로드
    const campaignName = (campaign?.name || 'unknown').toLowerCase();
    const path = getPath(campaignName, 'target');
    const key = `${path}/target_${campaignName}.xlsx`;
    await uploadToS3({ key, file, isNoCache: true });
    //
    const codes = json.map((j) => j.code);
    const domains = await prisma.domain.findMany({
      where: { code: { in: codes } },
    });
    const domainMap = new Map(domains.map((d) => [d.code, d.id]));

    const goals = await prisma.domainGoal.findMany({
      where: { campaignId, domainId: { in: [...domainMap.values()] } },
    });

    const goalMap = new Map(goals.map((g) => [g.domainId, g.id]));

    const jsonData = json
      .map((row) => {
        const domainId = domainMap.get(row.code);
        const targetId = domainId ? goalMap.get(domainId) : undefined;
        return targetId ? { ...row, domainId, targetId } : null;
      })
      .filter(Boolean) as TargetTransformProps[];

    let result = await prisma.$transaction(
      jsonData.map((row) =>
        prisma.domainGoal.update({
          where: { id: row.targetId },
          data: {
            ff: row.ff,
            ffSes: row.ffSes,
            fsm: row.fsm,
            fsmSes: row.fsmSes,
          },
          select: {
            id: true,
            domainId: true,
            ff: true,
            ffSes: true,
            fsm: true,
            fsmSes: true,
          },
        })
      )
    );

    const domainNameMap = new Map(domains.map((d) => [d.id, d.name]));
    result = result.map((g) => {
      const total = g.ff + g.ffSes + g.fsm + g.fsmSes;
      const name = domainNameMap.get(g.domainId);
      return { ...g, total, name };
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
