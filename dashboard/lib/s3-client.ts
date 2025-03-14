/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { execSync } from 'child_process';
import { getS3Client } from './aws/s3-client';

const getCredentials = () => {
  const AWS_PROFILE =
    process.env.ASSETS_S3_BUCKET_PROFILE || 'staging_splus_quiz';

  try {
    const credentialsJson = execSync(
      `aws sts get-caller-identity --profile ${AWS_PROFILE}`,
      {
        encoding: 'utf-8',
      }
    );
    return JSON.parse(credentialsJson);
  } catch (error) {
    console.error('AWS Credentials Error:', error);
    return null;
  }
};

// S3 클라이언트 설정
// const s3Client = new S3Client({
//   region: process.env.AWS_SES_REGION, // S3 리전 설정
//   credentials: fromIni({
//     profile: process.env.ASSETS_S3_BUCKET_PROFILE,
//   }),
// });
const s3Client = getS3Client();

const uploadToS3 = async ({
  key,
  file,
  isNoCache = false,
}: {
  key: string;
  file: File;
  isNoCache?: boolean;
}) => {
  try {
    // 파일 버퍼를 읽고 저장
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 저장할 경로
    const command = new PutObjectCommand({
      Bucket: process.env.ASSETS_S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ...(isNoCache
        ? { CacheControl: 'no-store, no-cache, must-revalidate' } // 캐시 제거
        : {}),
    });

    const response = await s3Client.send(command);
    return response;
  } catch (error) {
    console.error(`S3에서 파일 저장하기 실패: ${key}`, error);
    throw error;
  }
};

const getFromS3 = async ({
  key,
  isNoCache = false,
}: {
  key: string;
  isNoCache?: boolean;
}) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.ASSETS_S3_BUCKET_NAME,
      Key: key,
      ...(isNoCache
        ? { ResponseCacheControl: 'no-store, no-cache, must-revalidate' } // 캐시 제거
        : {}),
    });

    const response = await s3Client.send(command);
    return response;
  } catch (error: any) {
    if (error.Code === 'NoSuchKey' || error.Code === 'AccessDenied') {
      // console.warn(`S3 파일 없음: ${key}`);
      return null; // 파일이 없을 경우 `null` 반환
    }

    console.error(`S3에서 파일 가져오기 실패: ${key}`, error);
    throw error; // 기타 오류는 다시 던지기
  }
};

export { getCredentials, getFromS3, s3Client, uploadToS3 };
