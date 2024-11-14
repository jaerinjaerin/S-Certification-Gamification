// app/quiz/actions.tsx
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function fetchQuizData({
  userId,
  campaignId,
  metadataId,
}: {
  userId: string;
  campaignId: string;
  metadataId: string;
}) {
  // 유저의 UserQuizHistory를 가져옴
  const userQuizHistory = await prisma.userQuizHistory.findFirst({
    where: {
      userId,
      quizCampaignId: campaignId,
      quizMetadataId: metadataId,
    },
  });

  // 해당 campaignId와 metadataId에 맞는 QuizSet 목록을 stage로 정렬하여 가져옴
  const quizSets = await prisma.quizSet.findMany({
    where: {
      metadata: {
        id: metadataId,
        campaignId: campaignId,
      },
    },
    orderBy: {
      stage: 'asc',
    },
    include: {
      questions: {
        include: {
          options: true,
        },
      },
    },
  });

  return {
    userQuizHistory,
    quizSets,
  };
}
