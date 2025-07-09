import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from '@aws-sdk/client-cloudfront';
import { fromIni } from '@aws-sdk/credential-provider-ini';

export async function invalidateCache(distributionId: string, paths: string[]) {
  try {
    const cloudFrontClient =
      process.env.ENV === 'local'
        ? new CloudFrontClient({
            region: 'us-east-1',
            credentials: fromIni({
              profile: process.env.ASSETS_S3_BUCKET_PROFILE,
            }),
          })
        : new CloudFrontClient({
            region: 'us-east-1',
          });

    const sanitizedPaths = paths.map((p) => p.replace(/\s+/g, ''));
    const command = new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        Paths: {
          Quantity: sanitizedPaths.length,
          Items: sanitizedPaths,
        },
        CallerReference: `${Date.now()}`, // 고유한 요청 ID (매번 다른 값 필요)
      },
    });

    const response = await cloudFrontClient.send(command);
    console.log('Invalidation successful:', response);
  } catch (error) {
    console.error('Error invalidating CloudFront cache:', error);
  }
}
