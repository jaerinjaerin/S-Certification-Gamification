/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { invalidateCache } from '@/lib/aws/cloudfront';
import { getPath } from '@/lib/file';
import { uploadToS3 } from '@/lib/s3-client';
import { prisma } from '@/model/prisma';
import { Campaign } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const campaignId = searchParams.get('campaignId') as string;

    const domains = await prisma.domain.findMany({
      include: { subsidiary: { include: { domains: true } } },
    });

    const goals = await prisma.domainGoal.findMany({
      where: { campaignId },
    });

    if (goals.length === 0) {
      return NextResponse.json({ success: true, result: [] }, { status: 200 });
    }

    const goalMap = new Map(goals.map((g) => [g.domainId, g]));

    const result = Array.from(goalMap.values()).map((goal) => {
      const domain = domains.find((d) => d.id === goal.domainId) || {
        name: 'Unknown Domain',
      };
      const { id, ff = 0, ffSes = 0, fsm = 0, fsmSes = 0 } = goal;
      const total = ff + ffSes + fsm + fsmSes;

      return {
        id,
        domainId: goal.domainId,
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
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const json = JSON.parse(
      formData.get('json') as string
    ) as TargetFromExcelProps[];
    const campaign = JSON.parse(formData.get('campaign') as string) as Campaign;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    //
    // excel 파일 업로드
    const path = getPath(campaign.slug, 'target');
    const key = `${path}/target_${campaign.slug}.xlsx`;
    await uploadToS3({ key, file, isNoCache: true });
    const distributionId: string = process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID!;
    invalidateCache(distributionId, [`/${key}`]);
    //
    const codes = json.map((j) => j.code);
    const domains = await prisma.domain.findMany({
      where: { code: { in: codes } },
      include: { subsidiary: true },
    });
    const domainMap = new Map(
      domains.map((d) => [
        d.code,
        {
          id: d.id,
          subsidiaryId: d.subsidiaryId,
          regionId: d.subsidiary?.regionId,
        },
      ])
    );

    const goals = await prisma.domainGoal.findMany({
      where: {
        campaignId: campaign.id,
        domainId: { in: [...domainMap.values()].map((d) => d.id) },
      },
    });

    const goalMap = new Map(goals.map((g) => [g.domainId, g.id]));
    const jsonData = json
      .map((row) => {
        const domainId = domainMap.get(row.code)?.id;
        const targetId = domainId ? goalMap.get(domainId) : undefined;
        return { ...row, domainId, targetId };
      })
      .filter(Boolean) as TargetTransformProps[];

    let result = await prisma.$transaction(
      jsonData.map((row) => {
        const domain = domainMap.get(row.code);
        return prisma.domainGoal.upsert({
          where: { id: row?.targetId ?? '' },
          create: {
            campaignId: campaign.id,
            domainId: row.domainId,
            ff: row.ff,
            ffSes: row.ffSes,
            fsm: row.fsm,
            fsmSes: row.fsmSes,
            subsidiaryId: domain?.subsidiaryId,
            regionId: domain?.regionId,
          },
          update: {
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
        });
      })
    );

    const domainNameMap = new Map(domains.map((d) => [d.id, d.name]));
    result = result.map((g) => {
      const total = g.ff + g.ffSes + g.fsm + g.fsmSes;
      const domain = domainNameMap.get(g.domainId);
      return { ...g, total, domain };
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
  }
}
