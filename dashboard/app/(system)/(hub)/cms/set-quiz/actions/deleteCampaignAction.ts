// app/actions/deleteCampaignAction.ts
'use server';
import { deleteS3Folder } from '@/lib/aws/s3-client';
import { s3Client } from '@/lib/s3-client';
import { prisma } from '@/model/prisma';
import { DeleteObjectsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

export async function deleteCampaign(campaignId: string) {
  try {
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
      },
    });

    if (!campaign) {
      return {
        success: false,
        error: '캠페인 삭제에 실패했습니다.',
      };
    }

    // 이미 시작한 캠페인은 삭제 불가
    if (campaign.startedAt < new Date()) {
      return {
        success: false,
        error: '이미 시작된 캠페인은 삭제할 수 없습니다.',
      };
    }

    const bucketName = process.env.ASSETS_S3_BUCKET_NAME!;
    const folderToDelete = `certification/${campaign.slug}/`;

    // 삭제할 S3 폴더 전체 제거 (폴더명 하위 객체들)
    await deleteS3Folder(bucketName, folderToDelete);

    await prisma.campaignSettings.deleteMany({
      where: { campaignId: campaign.id },
    });

    await prisma.question.deleteMany({
      where: {
        quizStage: {
          quizSet: {
            campaignId: campaign.id,
          },
        },
      },
    });

    await prisma.quizStage.deleteMany({
      where: {
        quizSet: {
          campaignId: campaign.id,
        },
      },
    });

    await prisma.quizSet.deleteMany({
      where: {
        campaignId: campaign.id,
      },
    });

    await prisma.campaign.delete({
      where: {
        id: campaign.id,
      },
    });

    // S3 폴더 내부 객체 삭제 (보조적 삭제 - 혹시 남은 파일 존재 시)
    try {
      const listResult = await s3Client.send(
        new ListObjectsV2Command({
          Bucket: bucketName,
          Prefix: folderToDelete,
        })
      );

      if (listResult.Contents?.length) {
        await s3Client.send(
          new DeleteObjectsCommand({
            Bucket: bucketName,
            Delete: {
              Objects: listResult.Contents.map((obj) => ({ Key: obj.Key! })),
            },
          })
        );
        console.log(`${listResult.Contents.length}개의 S3 파일 삭제 완료`);
      }
    } catch (s3Error) {
      console.error('S3 파일 삭제 중 오류 발생:', s3Error);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error delete campaign: ', error);
    return { success: false, error: error.message };
  }
}
