const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // 공통 캠페인 정보 생성
  const campaign = await prisma.quizCampaign.create({
    data: {
      title: '기초 상식 퀴즈 - 한국인을 위한 쉬운 퀴즈',
      releaseDate: new Date('2024-12-01'),
    },
  });

  // QuizMetadata 생성
  const metadata = await prisma.quizMetadata.create({
    data: {
      serviceEntity: 'Korean Entity',
      country: 'South Korea',
      language: 'Korean',
      // campaignId: campaign.id,
    },
  });

  if (!metadata || !metadata.id) {
    throw new Error('Metadata creation failed.');
  }

  // 아주 쉬운 퀴즈 세트 생성
  const quizSets = await Promise.all(
    Array.from({ length: 5 }).map(async (_, index) => {
      // QuizSet 생성
      const quizSet = await prisma.quizSet.create({
        data: {
          title: `기초 상식 퀴즈 세트 ${index + 1}`,
          timeLimitSeconds: 300 + index * 60,
          lives: 3 + index,
          stage: index + 1,
          nextStage: index < 4 ? index + 2 : null,
          metadataId: metadata.id,
          campaignId: campaign.id,
        },
      });

      // 각 질문을 생성하고, 정답 옵션을 설정합니다.
      const questions = await Promise.all(
        [
          {
            questionText: '한국의 수도는 어디인가요?',
            correctAnswerIndex: 0, // 정답은 첫 번째 옵션
            options: ['서울', '부산', '대구', '인천'],
          },
          {
            questionText: '한글을 창제한 왕은 누구인가요?',
            correctAnswerIndex: 0,
            options: ['세종대왕', '광해군', '태종', '정조'],
          },
          {
            questionText: '다음 중 한국의 전통 음식은 무엇인가요?',
            correctAnswerIndex: 0,
            options: ['김치', '스시', '피자', '타코'],
          },
          {
            questionText: '한국의 대표적인 민속춤은 무엇인가요?',
            correctAnswerIndex: 0,
            options: ['탈춤', '탱고', '삼바', '왈츠'],
          },
          {
            questionText: '한국의 화폐 단위는 무엇인가요?',
            correctAnswerIndex: 0,
            options: ['원', '달러', '엔', '유로'],
          },
        ]
          .slice(0, 3 + index) // 세트별로 3~5개의 질문 포함
          .map(async ({ questionText, correctAnswerIndex, options }) => {
            // 각 옵션을 먼저 생성하여 ID를 얻습니다.
            const createdOptions = await Promise.all(
              options.map((optionText) =>
                prisma.quizOption.create({
                  data: {
                    text: optionText,
                  },
                })
              )
            );

            // correctAnswerIndex로 정답 옵션 ID를 찾습니다.
            const correctOption = createdOptions[correctAnswerIndex];

            if (!correctOption) {
              throw new Error(
                `정답 옵션을 찾을 수 없습니다: 인덱스 ${correctAnswerIndex}`
              );
            }

            // 질문을 생성하고, correctOptionId를 설정합니다.
            const question = await prisma.quizQuestion.create({
              data: {
                questionText,
                quizSetId: quizSet.id,
                correctOptionId: correctOption.id, // 정답 옵션 ID 설정
                options: {
                  connect: createdOptions.map((option) => ({ id: option.id })),
                },
              },
            });

            return question;
          })
      );

      return { quizSet, questions };
    })
  );

  console.log(
    `Created ${quizSets.length} QuizSets with basic Korean knowledge questions`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
