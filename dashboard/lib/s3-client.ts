import { S3Client } from '@aws-sdk/client-s3';
import { execSync } from 'child_process';
import { fromIni } from '@aws-sdk/credential-provider-ini';

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
const s3Client = new S3Client({
  region: process.env.AWS_SES_REGION, // S3 리전 설정
  credentials: fromIni({
    profile: process.env.ASSETS_S3_BUCKET_PROFILE,
  }),
});

export { s3Client, getCredentials };
