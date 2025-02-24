/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/model/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3 } from '@/lib/s3-client';
import { Campaign } from '@prisma/client';
import { getPath } from '@/lib/file';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const campaignId = searchParams.get('campaignId') as string;

    await prisma.$connect();

    const images = await prisma.image.findMany({
      // where: { campaignId },
      select: { id: true, imagePath: true, alt: true, updatedAt: true },
      orderBy: { createdAt: 'asc' },
    });
    const badges = await prisma.quizBadge.findMany({
      // where: { campaignId },
      select: { id: true, imagePath: true, name: true, updatedAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const result = {
      badge: badges.map((image, index) => ({
        index,
        id: image.id,
        type: image.name,
        url: image.imagePath,
        date: image.updatedAt,
      })),
      character: images
        .filter((image) => image.alt === 'character')
        .map((image, index) => ({
          index,
          id: image.id,
          type: image.alt,
          url: image.imagePath,
          date: image.updatedAt,
        })),
      background: images
        .filter((image) => image.alt === 'background')
        .map((image, index) => ({
          index,
          id: image.id,
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
    await prisma.$connect();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const group = formData.get('group') as string;
    const campaign = JSON.parse(formData.get('campaign') as string) as Campaign;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const count =
      group === 'badge'
        ? await prisma.quizBadge.count({ where: { campaignId: campaign.id } })
        : await prisma.image.count({
            where: { campaignId: campaign.id, alt: group },
          });
    const format = file.type.split('/')[1];

    let imagePath = getPath(campaign.name, `images/${group}`);
    imagePath = `${imagePath}/${count + 1}.${format}`;

    // 파일 업로드드
    await uploadToS3({ key: imagePath, file, isNoCache: true });

    let result = {};
    let uploadedFile = null;
    if (group === 'badge') {
      // 데이터베이스에 업로드된 파일 정보 저장 (예제)
      uploadedFile = await prisma.quizBadge.create({
        data: {
          name: group,
          imagePath: `/${imagePath}`,
          campaignId: campaign.id,
        },
      });
      //
      result = {
        id: uploadedFile.id,
        type: uploadedFile.name,
        url: uploadedFile.imagePath,
        date: uploadedFile.createdAt,
      };
    } else {
      // 데이터베이스에 업로드된 파일 정보 저장 (예제)
      uploadedFile = await prisma.image.create({
        data: {
          alt: group,
          caption: group,
          format: format,
          imagePath: `/${imagePath}`,
          campaignId: campaign.id,
        },
      });
      //
      result = {
        id: uploadedFile.id,
        type: uploadedFile.alt,
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
        type: updatedFile.name,
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
        type: updatedFile.alt,
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

// export async function DELETE(request: NextRequest) {
//   try {
//     await prisma.$connect();

//     const { id, group } = await request.json();

//     if (!id || !category) {
//       return NextResponse.json(
//         { error: 'Missing required parameters' },
//         { status: 400 }
//       );
//     }

//     // 기존 파일 정보 확인
//     let existingFile = null;
//     if (group === 'badge') {
//       existingFile = await prisma.quizBadge.findUnique({
//         where: { id },
//       });
//     } else {
//       existingFile = await prisma.image.findUnique({
//         where: { id },
//       });
//     }

//     if (!existingFile) {
//       return NextResponse.json({ error: 'File not found' }, { status: 404 });
//     }

//     // 파일 경로
//     const filePath = existingFile.imagePath
//       ? path.join(process.cwd(), 'public', existingFile.imagePath)
//       : null;

//     // 파일 삭제
//     if (filePath) {
//       try {
//         await unlink(filePath);
//         console.log(`File deleted: ${filePath}`);
//       } catch (error) {
//         console.warn('Failed to delete file:', error);
//       }
//     }

//     // DB 데이터 삭제
//     if (group === 'badge') {
//       await prisma.quizBadge.delete({
//         where: { id },
//       });
//     } else {
//       await prisma.image.delete({
//         where: { id },
//       });
//     }

//     console.log(`Deleted from database: ${id}`);

//     return NextResponse.json(
//       { message: 'File deleted successfully' },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error('Error deleting file:', error);
//     return NextResponse.json({ message: 'Delete failed' }, { status: 500 });
//   } finally {
//     await prisma.$disconnect();
//   }
// }
