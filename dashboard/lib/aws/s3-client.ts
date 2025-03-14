import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3';

import { fromIni } from '@aws-sdk/credential-provider-ini';

export const getS3Client = () => {
  const s3Client =
    process.env.ENV === 'local'
      ? new S3Client({
          region: process.env.ASSETS_S3_BUCKET_REGION,
          credentials: fromIni({
            profile: process.env.ASSETS_S3_BUCKET_PROFILE,
          }),
        })
      : new S3Client({
          region: process.env.ASSETS_S3_BUCKET_REGION,
        });

  return s3Client;
};

export async function deleteS3Folder(bucketName: string, folderPath: string) {
  try {
    // 1️⃣ S3에서 해당 폴더(prefix) 아래의 모든 객체 가져오기
    const listParams = {
      Bucket: bucketName,
      Prefix: folderPath.endsWith('/') ? folderPath : folderPath + '/',
    };

    const s3Client = getS3Client();
    const listedObjects = await s3Client.send(
      new ListObjectsV2Command(listParams)
    );

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      console.log('📁 폴더가 비어있거나 존재하지 않습니다.');
      return;
    }

    // 2️⃣ 가져온 객체들을 삭제 요청
    const deleteParams = {
      Bucket: bucketName,
      Delete: {
        Objects: listedObjects.Contents.map((obj) => ({ Key: obj.Key })),
      },
    };

    await s3Client.send(new DeleteObjectsCommand(deleteParams));

    console.log(`✅ 폴더 삭제 완료: ${folderPath}`);
  } catch (error) {
    console.error('❌ S3 폴더 삭제 중 오류 발생:', error);
  }
}
