const { PrismaClient } = require("@prisma/client");
const uuid = require("uuid");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting to seed data...");

  // Create languages
  const languages = [
    { id: uuid.v4(), code: "en", name: "English" },
    { id: uuid.v4(), code: "ko", name: "Korean" },
    { id: uuid.v4(), code: "ja", name: "Japanese" },
  ];

  for (const language of languages) {
    await prisma.language.create({
      data: language,
    });
    console.log(`Created Language: ${language.name}`);
  }

  // Create countries
  const countries = [
    { id: uuid.v4(), code: "US", name: "United States" },
    { id: uuid.v4(), code: "KR", name: "South Korea" },
    { id: uuid.v4(), code: "JP", name: "Japan" },
  ];

  for (const country of countries) {
    await prisma.country.create({
      data: country,
    });
    console.log(`Created Country: ${country.name}`);
  }

  // Create CountryLanguage entries
  const countryLanguageEntries = [
    { countryCode: "US", languageCode: "en" },
    { countryCode: "KR", languageCode: "ko" },
    { countryCode: "JP", languageCode: "ja" },
    { countryCode: "JP", languageCode: "en" }, // Japan supports English as well
  ];

  for (const entry of countryLanguageEntries) {
    const country = countries.find((c) => c.code === entry.countryCode);
    const language = languages.find((l) => l.code === entry.languageCode);

    if (country && language) {
      await prisma.countryLanguage.create({
        data: {
          id: uuid.v4(),
          countryId: country.id,
          languageId: language.id,
          languageCode: language.code,
        },
      });
      console.log(
        `Linked Country (${country.name}) with Language (${language.name})`
      );
    }
  }

  // Create user jobs
  const userJobs = [
    { id: uuid.v4(), name: "ff", description: "group A" },
    { id: uuid.v4(), name: "other", description: "group B" },
  ];

  for (const userJob of userJobs) {
    await prisma.userJob.create({
      data: userJob,
    });
    console.log(`Created User Job: ${userJob.name}`);
  }

  // Create a campaign
  const campaignId = uuid.v4();
  const campaign = await prisma.campaign.create({
    data: {
      id: campaignId,
      name: "Simple Quiz Campaign",
      description: "A campaign with a basic quiz structure.",
    },
  });

  console.log(`Created Campaign: ${campaign.name}`);

  // Add CountryActivity entries
  const activityId = "test_activity_id";
  for (const country of countries) {
    const countryActivityId = uuid.v4();
    await prisma.countryActivity.create({
      data: {
        id: countryActivityId,
        campaignId: campaignId,
        activityId: activityId,
        countryId: country.id,
        countryCode: country.code,
      },
    });
    console.log(
      `Created CountryActivity for Country: ${country.name}, Activity ID: ${activityId}`
    );
    break; // 하나의 activityId는 하나의 countryId만 매칭되므로, 한 번만 실행
  }

  console.log("Seeding completed!");

  // Create a quiz set
  const quizSetId = uuid.v4();
  const quizSet = await prisma.quizSet.create({
    data: {
      id: quizSetId,
      name: "General Knowledge Quiz",
      description: "A quiz set to test general knowledge.",
      campaignId: campaign.id,
    },
  });

  console.log(`Created Quiz Set: ${quizSet.name}`);

  // Create translations for the quiz set
  const quizSetTranslations = [
    { languageCode: "en", text: "General Knowledge Quiz" },
    { languageCode: "ko", text: "일반 상식 퀴즈" },
    { languageCode: "ja", text: "一般知識クイズ" },
  ];

  for (const translation of quizSetTranslations) {
    await prisma.quizSetTranslation.create({
      data: {
        id: uuid.v4(),
        languageCode: translation.languageCode,
        text: translation.text,
        quizSetId: quizSet.id,
      },
    });
  }

  // Create 5 stages
  const stages = [];
  for (let i = 1; i <= 5; i++) {
    const stageId = uuid.v4();
    const stage = await prisma.stage.create({
      data: {
        id: stageId,
        name: `Stage ${i}`,
        order: i,
        quizSetId: quizSet.id,
      },
    });
    stages.push(stage);
    console.log(`Created Stage: ${stage.name}`);
  }

  // Create random questions and options for each stage
  for (const stage of stages) {
    const questionCount = Math.floor(Math.random() * 4) + 5; // 5 to 8 questions
    for (let i = 1; i <= questionCount; i++) {
      const questionId = uuid.v4();
      const question = await prisma.question.create({
        data: {
          id: questionId,
          text: `Question ${i} in ${stage.name}`,
          lifeCount: 3,
          expiresIn: 60, // Expires in 60 seconds
          stageId: stage.id,
        },
      });
      console.log(`Created Question: ${question.text}`);

      // Create translations for the question
      const questionTranslations = [
        { language: "en", text: `Question ${i} in ${stage.name}` },
        { language: "ko", text: `스테이지 ${stage.order}의 문제 ${i}` },
        { language: "ja", text: `ステージ${stage.order}の質問${i}` },
      ];

      for (const translation of questionTranslations) {
        await prisma.questionTranslation.create({
          data: {
            id: uuid.v4(),
            languageCode: translation.language,
            text: translation.text,
            questionId: question.id,
          },
        });
      }

      // Create 4 options for each question
      for (let j = 1; j <= 4; j++) {
        const optionId = uuid.v4();
        const isCorrect = j === 1; // First option is correct
        const option = await prisma.questionOption.create({
          data: {
            id: optionId,
            text: `Option ${j} for Question ${i}`,
            order: j,
            questionId: question.id,
          },
        });
        console.log(`Created Option: ${option.text} (Correct: ${isCorrect})`);

        // Create translations for the option
        const optionTranslations = [
          { language: "en", text: `Option ${j} for Question ${i}` },
          { language: "ko", text: `문제 ${i}의 옵션 ${j}` },
          { language: "ja", text: `質問${i}の選択肢${j}` },
        ];

        for (const translation of optionTranslations) {
          await prisma.questionOptionTranslation.create({
            data: {
              id: uuid.v4(),
              languageCode: translation.language,
              text: translation.text,
              optionId: option.id,
            },
          });
        }
      }

      // Assign the question to random countries and user jobs
      for (const country of countries) {
        for (const userJob of userJobs) {
          if (Math.random() > 0.5) {
            await prisma.countryUserJobQuestion.create({
              data: {
                id: uuid.v4(),
                countryId: country.id,
                userJobId: userJob.id,
                userJobName: userJob.name,
                questionId: question.id,
                isEnabled: true,
              },
            });
            console.log(
              `Assigned Question ${question.text} to Country ${country.name}, User Job ${userJob.name}`
            );
          }
        }
      }
    }
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();

// async function main() {
//   // 공통 캠페인 정보 생성
//   const campaign = await prisma.quizCampaign.create({
//     data: {
//       title: '기초 상식 퀴즈 - 한국인을 위한 쉬운 퀴즈',
//       releaseDate: new Date('2024-12-01'),
//     },
//   });

//   // QuizMetadata 생성
//   const metadata = await prisma.quizMetadata.create({
//     data: {
//       serviceEntity: 'Korean Entity',
//       country: 'South Korea',
//       language: 'Korean',
//       // campaignId: campaign.id,
//     },
//   });

//   if (!metadata || !metadata.id) {
//     throw new Error('Metadata creation failed.');
//   }

//   // 아주 쉬운 퀴즈 세트 생성
//   const quizSets = await Promise.all(
//     Array.from({ length: 5 }).map(async (_, index) => {
//       // QuizSet 생성
//       const quizSet = await prisma.quizSet.create({
//         data: {
//           title: `기초 상식 퀴즈 세트 ${index + 1}`,
//           timeLimitSeconds: 300 + index * 60,
//           lives: 3 + index,
//           stage: index + 1,
//           nextStage: index < 4 ? index + 2 : null,
//           metadataId: metadata.id,
//           campaignId: campaign.id,
//         },
//       });

//       // 각 질문을 생성하고, 정답 옵션을 설정합니다.
//       const questions = await Promise.all(
//         [
//           {
//             questionText: '한국의 수도는 어디인가요?',
//             correctAnswerIndex: 0, // 정답은 첫 번째 옵션
//             options: ['서울', '부산', '대구', '인천'],
//           },
//           {
//             questionText: '한글을 창제한 왕은 누구인가요?',
//             correctAnswerIndex: 0,
//             options: ['세종대왕', '광해군', '태종', '정조'],
//           },
//           {
//             questionText: '다음 중 한국의 전통 음식은 무엇인가요?',
//             correctAnswerIndex: 0,
//             options: ['김치', '스시', '피자', '타코'],
//           },
//           {
//             questionText: '한국의 대표적인 민속춤은 무엇인가요?',
//             correctAnswerIndex: 0,
//             options: ['탈춤', '탱고', '삼바', '왈츠'],
//           },
//           {
//             questionText: '한국의 화폐 단위는 무엇인가요?',
//             correctAnswerIndex: 0,
//             options: ['원', '달러', '엔', '유로'],
//           },
//         ]
//           .slice(0, 3 + index) // 세트별로 3~5개의 질문 포함
//           .map(async ({ questionText, correctAnswerIndex, options }) => {
//             // 각 옵션을 먼저 생성하여 ID를 얻습니다.
//             const createdOptions = await Promise.all(
//               options.map((optionText) =>
//                 prisma.quizOption.create({
//                   data: {
//                     text: optionText,
//                   },
//                 })
//               )
//             );

//             // correctAnswerIndex로 정답 옵션 ID를 찾습니다.
//             const correctOption = createdOptions[correctAnswerIndex];

//             if (!correctOption) {
//               throw new Error(
//                 `정답 옵션을 찾을 수 없습니다: 인덱스 ${correctAnswerIndex}`
//               );
//             }

//             // 질문을 생성하고, correctOptionId를 설정합니다.
//             const question = await prisma.quizQuestion.create({
//               data: {
//                 questionText,
//                 quizSetId: quizSet.id,
//                 correctOptionId: correctOption.id, // 정답 옵션 ID 설정
//                 options: {
//                   connect: createdOptions.map((option) => ({ id: option.id })),
//                 },
//               },
//             });

//             return question;
//           })
//       );

//       return { quizSet, questions };
//     })
//   );

//   console.log(
//     `Created ${quizSets.length} QuizSets with basic Korean knowledge questions`
//   );
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
