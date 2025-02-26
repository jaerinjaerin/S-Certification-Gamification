'user server';

import { S3Client } from '@aws-sdk/client-s3';
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
