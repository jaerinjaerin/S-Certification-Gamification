import { getS3Client } from '@/lib/aws/s3-client';
import { prisma } from '@/model/prisma';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import archiver from 'archiver';
import { setMaxListeners } from 'events';
import { NextResponse } from 'next/server';
import { PassThrough, Readable } from 'stream';

// DB에서 S3 파일 키를 가져오는 함수
async function getS3FileKeysFromDB(): Promise<string[]> {
  const quizSetFiles = await prisma.quizSetFile.findMany();
  return quizSetFiles.map((file) => file.path);
}

const BATCH_SIZE = 50;
const TEMP_BUCKET = process.env.ASSETS_S3_BUCKET_NAME!; // 부분 ZIP 저장 버킷
setMaxListeners(100);

async function createBatchZip(batchFiles: string[], batchIndex: number) {
  const s3Client = getS3Client();
  const zipStream = new PassThrough();
  const archive = archiver('zip', { zlib: { level: 5 } });

  archive.pipe(zipStream);

  for await (const key of batchFiles) {
    try {
      const params = { Bucket: process.env.ASSETS_S3_BUCKET_NAME!, Key: key };
      const command = new GetObjectCommand(params);
      const s3Response = await s3Client.send(command);

      if (s3Response.Body) {
        const nodeStream = Readable.from(
          s3Response.Body as AsyncIterable<Buffer>,
          { highWaterMark: 1024 * 1024 * 5 }
        );
        archive.append(nodeStream, { name: key.split('/').pop() || key });
      }
    } catch (error) {
      console.error(`Error fetching S3 file ${key}:`, error);
    }
  }

  await archive.finalize();

  // S3에 업로드
  const zipKey = `temp_batch_${batchIndex}.zip`;
  const uploadCommand = new PutObjectCommand({
    Bucket: TEMP_BUCKET,
    Key: zipKey,
    Body: zipStream,
    ContentType: 'application/zip',
  });

  await s3Client.send(uploadCommand);
  console.log(`Batch ${batchIndex} ZIP uploaded to S3`);

  return zipKey;
}

export async function GET() {
  try {
    const fileKeys = await getS3FileKeysFromDB();
    if (!fileKeys.length) {
      return NextResponse.json({ error: 'No files found' }, { status: 404 });
    }

    const batchZipKeys = [];
    for (let i = 0; i < fileKeys.length; i += BATCH_SIZE) {
      const batchFiles = fileKeys.slice(i, i + BATCH_SIZE);
      const zipKey = await createBatchZip(batchFiles, i / BATCH_SIZE + 1);
      batchZipKeys.push(zipKey);
    }

    // 최종 ZIP 압축
    const finalStream = new PassThrough();
    const finalArchive = archiver('zip', { zlib: { level: 5 } });

    finalArchive.pipe(finalStream);

    const s3Client = getS3Client();
    for await (const zipKey of batchZipKeys) {
      try {
        const params = { Bucket: TEMP_BUCKET, Key: zipKey };
        const command = new GetObjectCommand(params);
        const s3Response = await s3Client.send(command);

        if (s3Response.Body) {
          const nodeStream = Readable.from(
            s3Response.Body as AsyncIterable<Buffer>
          );
          finalArchive.append(nodeStream, { name: zipKey });
        }
      } catch (error) {
        console.error(`Error fetching batch ZIP ${zipKey}:`, error);
      }
    }

    await finalArchive.finalize();

    // 웹 스트림으로 변환 후 응답 반환
    const webStream = new ReadableStream({
      start(controller) {
        finalStream.on('data', (chunk) => controller.enqueue(chunk));
        finalStream.on('end', () => controller.close());
        finalStream.on('error', (err) => controller.error(err));
      },
    });

    return new Response(webStream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="final.zip"',
      },
    });
  } catch (error) {
    console.error('Error in GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
