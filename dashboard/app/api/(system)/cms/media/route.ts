/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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

    await prisma.$connect();

    // const images = await prisma.image.findMany({
    //   where: { campaignId },
    //   select: {
    //     id: true,
    //     title: true,
    //     alt: true,
    //     imagePath: true,
    //     updatedAt: true,
    //   },
    //   orderBy: { title: { sort: 'asc' } },
    // });

    // const badges = await prisma.quizBadge.findMany({
    //   where: { campaignId },
    //   select: {
    //     id: true,
    //     name: true,
    //     imagePath: true,
    //     updatedAt: true,
    //   },
    //   orderBy: { name: 'asc' },
    // });

    const images: {
      id: string;
      title: string;
      alt: string;
      imagePath: string;
      updatedAt: Date;
    }[] = await prisma.$queryRaw`
      SELECT id, title, alt, "imagePath", "updatedAt"
      FROM "Image"
      WHERE "campaignId" = ${campaignId}
      ORDER BY CAST(REGEXP_REPLACE("title", '[^0-9]', '', 'g') AS INTEGER) ASC
    `;

    const badges: {
      id: string;
      name: string;
      imagePath: string;
      updatedAt: Date;
    }[] = await prisma.$queryRaw`
      SELECT id, name, "imagePath", "updatedAt"
      FROM "QuizBadge"
      WHERE "campaignId" = ${campaignId}
      ORDER BY CAST(REGEXP_REPLACE("name", '[^0-9]', '', 'g') AS INTEGER) ASC
    `;

    const result = {
      badge: badges.map((image, index) => ({
        index,
        id: image.id,
        name: image.name,
        type: 'badge',
        url: image.imagePath,
        date: image.updatedAt,
      })),
      character: images
        .filter((image) => image.alt === 'character')
        .map((image, index) => ({
          index,
          id: image.id,
          name: image.title,
          type: image.alt,
          url: image.imagePath,
          date: image.updatedAt,
        })),
      background: images
        .filter((image) => image.alt === 'background')
        .map((image, index) => ({
          index,
          id: image.id,
          name: image.title,
          type: image.alt,
          url: image.imagePath,
          date: image.updatedAt,
        })),
    };

    return NextResponse.json({ success: true, result }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching data:', error);
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
    const group = formData.get('group') as string;
    const campaign = JSON.parse(formData.get('campaign') as string) as Campaign;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    await prisma.$connect();

    const count =
      group === 'badge'
        ? await prisma.quizBadge.count({ where: { campaignId: campaign.id } })
        : await prisma.image.count({
            where: { campaignId: campaign.id, alt: group },
          });

    const index = `${count + 1}`;
    const format = file.type.split('/')[1];
    console.log('🚀 ~ POST ~ index:', index);
    let imagePath = getPath(campaign.name, `images/${group}`);
    imagePath = `${imagePath}/${group}_${index}.${format}`;

    console.log('🚀 ~ POST ~ imagePath:', imagePath);
    // 파일 업로드
    await uploadToS3({ key: imagePath, file, isNoCache: true });
    // const pathsToInvalidate = [
    //   `/certification/${campaign.slug}/jsons/channels.json`,
    // ]; // 무효화할 경로

    const distributionId: string = process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID!;
    invalidateCache(distributionId, [`/${imagePath}`]);

    let result = {};
    let uploadedFile = null;
    if (group === 'badge') {
      // 데이터베이스에 업로드된 파일 정보 저장 (예제)
      uploadedFile = await prisma.quizBadge.create({
        data: {
          name: index,
          imagePath: `/${imagePath}`,
          campaignId: campaign.id,
        },
      });
      //
      result = {
        id: uploadedFile.id,
        name: uploadedFile.name,
        type: group,
        url: uploadedFile.imagePath,
        date: uploadedFile.createdAt,
      };
    } else {
      // 데이터베이스에 업로드된 파일 정보 저장 (예제)
      uploadedFile = await prisma.image.create({
        data: {
          alt: group,
          title: index,
          caption: group,
          format: format,
          imagePath: `/${imagePath}`,
          campaignId: campaign.id,
        },
      });

      //
      result = {
        id: uploadedFile.id,
        name: uploadedFile.title,
        type: group,
        url: uploadedFile.imagePath,
        date: uploadedFile.createdAt,
      };
    }

    return NextResponse.json({ success: true, result }, { status: 200 });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: 'Upload failed',
          details: error.message,
        },
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: NextRequest) {
  try {
    await prisma.$connect();

    const formData = await request.formData();
    const id = formData.get('id') as string;
    const group = formData.get('group') as string;
    const file = formData.get('file') as File;

    // 기존 파일이 DB에 존재하는지 확인
    let existingFile = null;
    if (group === 'badge') {
      existingFile = await prisma.quizBadge.findUnique({
        where: { id },
      });
    } else {
      existingFile = await prisma.image.findUnique({
        where: { id },
      });
    }

    if (!existingFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // 파일 업로드
    const Key = existingFile.imagePath.replace(/^\/+/, '');
    await uploadToS3({ key: Key, file, isNoCache: true });

    const distributionId: string = process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID!;
    invalidateCache(distributionId, [`/${Key}`]);

    let updatedFile = null;
    let result = {};
    //
    if (group === 'badge') {
      updatedFile = await prisma.quizBadge.update({
        where: { id },
        data: { updatedAt: new Date() },
      });
      //
      result = {
        id: updatedFile.id,
        name: updatedFile.name,
        type: group,
        url: updatedFile.imagePath,
        date: updatedFile.updatedAt,
      };
    } else {
      updatedFile = await prisma.image.update({
        where: { id },
        data: { updatedAt: new Date() },
      });
      //
      result = {
        id: updatedFile.id,
        name: updatedFile.title,
        type: group,
        url: updatedFile.imagePath,
        date: updatedFile.updatedAt,
      };
    }
    return NextResponse.json({ success: true, result }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating file:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: 'Update failed',
          details: error.message,
        },
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
