import { getS3Client } from '@/lib/aws/s3-client';
import { prisma } from '@/model/prisma';
import { PassThrough, Readable } from 'stream';

import { GetObjectCommand } from '@aws-sdk/client-s3';
import archiver from 'archiver';
import { setMaxListeners } from 'events';
import { NextResponse } from 'next/server';

// 예시: DB에서 S3 파일 키들을 조회하는 함수 (실제 DB 쿼리로 교체)
async function getS3FileKeysFromDB(): Promise<string[]> {
  const quizSetFiles = await prisma.quizSetFile.findMany();
  return quizSetFiles
    .map((file) => file.path)
    .filter((key, index) => index !== 75 && index < 100);
}

const BATCH_SIZE = 50;
setMaxListeners(100);

export async function GET() {
  try {
    // DB에서 S3 파일 키 목록을 조회
    const fileKeys = await getS3FileKeysFromDB();

    if (!fileKeys || fileKeys.length === 0) {
      return NextResponse.json(
        { error: 'No files found in the database' },
        { status: 404 }
      );
    }
    const passThrough = new PassThrough();
    // response.setHeader('Content-Type', 'application/zip');
    // response.setHeader(
    //   'Content-Disposition',
    //   'attachment; filename="files.zip"'
    // );

    // AWS S3 클라이언트 초기화 (환경변수로 설정)
    const s3Client = getS3Client();

    // ZIP 아카이브를 위한 PassThrough 스트림 생성
    // const archiveStream = new PassThrough();
    const archive = archiver('zip', { zlib: { level: 5 } });

    archive.on('error', (err) => {
      console.error('Archive error:', err);
      // 스트리밍 중 에러 발생 시, 더 이상 응답을 조작하기 어렵습니다.
    });

    archive.on('progress', (progress) => {
      console.log(`Processed ${progress.entries.processed} entries`);
    });
    archive.on('progress', (progress) => {
      console.log(
        `압축 진행: ${progress.entries.processed} / ${progress.entries.total} 항목 처리됨`
      );
    });

    // archiver를 스트림에 파이핑
    archive.pipe(passThrough);

    // for (const key of fileKeys) {
    //   try {
    //     const params = {
    //       Bucket: process.env.ASSETS_S3_BUCKET_NAME!,
    //       Key: key.replace(/^\/+/, ''),
    //     };
    //     const command = new GetObjectCommand(params);
    //     const s3Response = await s3Client.send(command);

    //     if (s3Response.Body) {
    //       // s3Response.Body는 Node.js 환경에서 사용 가능한 스트림(ChecksumStream 등)이므로,
    //       // 바로 NodeReadable로 타입 단언하여 사용합니다.
    //       // const nodeStream = s3Response.Body as unknown as Readable;
    //       const nodeStream = s3Response.Body as unknown as Readable;
    //       archive.append(nodeStream, { name: key.split('/').pop() || key });
    //       console.log(`File ${key} added to ZIP archive`);
    //     }
    //   } catch (error) {
    //     console.error(`Error fetching S3 file ${key}:`, error);
    //     // 개별 파일 오류 발생 시 원하는 방식으로 처리 (여기서는 계속 진행)
    //   }
    // }

    for (let i = 0; i < fileKeys.length; i += BATCH_SIZE) {
      const batchFiles = fileKeys.slice(i, i + BATCH_SIZE);

      console.log(
        `Processing batch ${i / BATCH_SIZE + 1}: ${batchFiles.length} files`
      );

      for await (const key of batchFiles) {
        try {
          const params = {
            Bucket: process.env.ASSETS_S3_BUCKET_NAME!,
            Key: key.replace(/^\/+/, ''),
          };
          const command = new GetObjectCommand(params);
          const s3Response = await s3Client.send(command);

          // if (s3Response.Body) {
          //   const nodeStream = s3Response.Body as unknown as Readable;
          //   nodeStream._readableState.highWaterMark = 1024 * 1024 * 5; // 5MB 버퍼 크기 증가
          //   archive.append(nodeStream, { name: key.split('/').pop() || key });
          // }
          if (s3Response.Body) {
            const nodeStream = Readable.from(
              s3Response.Body as AsyncIterable<Buffer>,
              {
                highWaterMark: 1024 * 1024 * 5, // 5MB 버퍼 크기 설정
              }
            );
            archive.append(nodeStream, { name: key.split('/').pop() || key });
          }
        } catch (error) {
          console.error(`Error fetching S3 file ${key}:`, error);
        }
      }
    }

    console.log('start Archive finalized');

    await archive.finalize();
    // console.log('Archive finalized');

    // // 응답 헤더 설정: ZIP 파일 다운로드
    // const headers = new Headers();
    // headers.set('Content-Type', 'application/zip');
    // headers.set('Content-Disposition', 'attachment; filename="files.zip"');

    // // Node.js의 archiveStream(PassThrough)를 Web ReadableStream으로 변환 (수동 변환)
    // const webStream = new ReadableStream<Uint8Array>({
    //   start(controller) {
    //     archiveStream.on('data', (chunk: any) => {
    //       // Buffer인 경우 Uint8Array로 변환
    //       console.log('chunk', chunk);
    //       controller.enqueue(
    //         chunk instanceof Buffer ? new Uint8Array(chunk) : chunk
    //       );
    //     });
    //     archiveStream.on('end', () => controller.close());
    //     archiveStream.on('error', (err: Error) => controller.error(err));
    //   },
    // });

    // console.log('Returning ZIP file stream');
    // return new NextResponse(webStream, { headers });
    // Node.js 스트림을 웹 스트림으로 변환한 후 Response 객체에 담아 반환
    const webStream = new ReadableStream({
      start(controller) {
        passThrough.on('data', (chunk) => controller.enqueue(chunk));
        passThrough.on('end', () => controller.close());
        passThrough.on('error', (err) => controller.error(err));
      },
    });

    return new Response(webStream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="files.zip"',
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
