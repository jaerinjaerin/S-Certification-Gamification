import { NextRequest, NextResponse } from 'next/server';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/s3-client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const prefix = searchParams.get('prefix'); // S3 내에서 검색할 폴더

  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.ASSETS_S3_BUCKET_NAME!,
      ...(prefix ? { Prefix: prefix } : {}), // 검색할 경로
    });

    const response = await s3Client.send(command);
    return NextResponse.json(response.Contents, { status: 200 });
  } catch (error) {
    console.error('❌ Error listing S3 objects:', error);
    return NextResponse.json(
      { error: 'Failed to list S3 objects' },
      { status: 500 }
    );
  }
}
