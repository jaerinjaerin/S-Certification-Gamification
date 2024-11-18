const { PrismaClient } = require("@prisma/client");
const uuid = require("uuid");

const prisma = new PrismaClient();

async function main() {
  // Languages
  const languageRecords = await prisma.language.createMany({
    data: [
      { code: "ko", name: "Korean" },
      { code: "en", name: "English" },
      { code: "ja", name: "Japanese" },
    ],
  });

  const languages = await prisma.language.findMany();
  const enLanguage = languages.find((lang: any) => lang.code === "en");
  const koLanguage = languages.find((lang: any) => lang.code === "ko");
  const jaLanguage = languages.find((lang: any) => lang.code === "ja");

  // Domains
  const domains = await prisma.domain.createMany({
    data: [
      { id: 29, name: "Korea", code: "ko" },
      { id: 30, name: "English", code: "en" },
      { id: 31, name: "Japan", code: "ja" },
    ],
  });

  // Campaign
  const campaign = await prisma.campaign.create({
    data: {
      name: "Global Campaign",
      description: "A multilingual campaign",
      startedAt: new Date(),
      endedAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      createrId: "test_admin_id",
    },
  });

  // Campaign Domains
  // const campaignDomains = await prisma.campaignDomain.createMany({
  //   data: [
  //     {
  //       campaignId: campaign.id,
  //       domainId: (await prisma.domain.findFirst({ where: { code: "ko" } }))!
  //         .id,
  //       activityId: "test_activity_id",
  //       languageIds: JSON.stringify([enLanguage.id, koLanguage.id].join(",")),
  //     },
  //     {
  //       campaignId: campaign.id,
  //       domainId: (await prisma.domain.findFirst({ where: { code: "en" } }))!
  //         .id,
  //       activityId: "test_activity_id",
  //       languageIds: JSON.stringify([enLanguage.id].join(",")),
  //     },
  //     {
  //       campaignId: campaign.id,
  //       domainId: (await prisma.domain.findFirst({ where: { code: "ja" } }))!
  //         .id,
  //       activityId: "test_activity_id",
  //       languageIds: JSON.stringify([enLanguage.id, jaLanguage.id].join(",")),
  //     },
  //   ],
  // });

  // User Jobs
  const jobs = await prisma.job.createMany({
    data: [
      { name: "ff", description: "User job FF" },
      { name: "others", description: "Other user jobs" },
    ],
  });

  // Stages with Questions and Options
  const allQuestions = [];
  const allKoQuestions: any[] = [];
  const allJaQuestions: any[] = [];

  for (let stageOrder = 1; stageOrder <= 5; stageOrder++) {
    const stage = await prisma.quizStage.create({
      data: {
        name: `Stage ${stageOrder}`,
        order: stageOrder,
        lifeCount: Math.floor(Math.random() * 3) + 4,
        campaignId: campaign.id,
      },
    });

    for (let qIndex = 0; qIndex < stage.lifeCount; qIndex++) {
      const question = await prisma.question.create({
        data: {
          text: `Question ${qIndex + 1} for Stage ${stageOrder}`,
          timeLimitSeconds: Math.floor(Math.random() * 60) + 30,
          quizStageId: stage.id,
          languageId: (await prisma.language.findFirst({
            where: { code: "en" },
          }))!.id,
        },
      });

      allQuestions.push(question.id);

      for (let optionIndex = 0; optionIndex < 4; optionIndex++) {
        await prisma.questionOption.create({
          data: {
            text: `Option ${optionIndex + 1} for Question ${qIndex + 1}`,
            order: optionIndex + 1,
            questionId: question.id,
            isCorrect: optionIndex === 0, // First option is correct
            languageId: (await prisma.language.findFirst({
              where: { code: "en" },
            }))!.id,
          },
        });
      }

      // Translations for Questions and Options
      const translations = ["ko", "ja"].map(async (code) => {
        const language = await prisma.language.findFirst({ where: { code } });
        if (!language) return;

        const translatedQuestion = await prisma.question.create({
          data: {
            text: `Translated ${question.text} in ${language.name}`,
            timeLimitSeconds: question.timeLimitSeconds,
            quizStageId: stage.id,
            languageId: language.id,
            parentId: question.id,
          },
        });

        if (code === "ko") {
          allKoQuestions.push(translatedQuestion.id);
        } else if (code === "ja") {
          allJaQuestions.push(translatedQuestion.id);
        }

        const options = await prisma.questionOption.findMany({
          where: { questionId: question.id },
        });
        options.forEach(async (option: any) => {
          await prisma.questionOption.create({
            data: {
              text: `Translated ${option.text} in ${language.name}`,
              order: option.order,
              questionId: translatedQuestion.id,
              isCorrect: option.isCorrect,
              languageId: language.id,
            },
          });
        });
      });

      await Promise.all(translations);
    }
  }

  // CampaignDomainQuizSet
  const selectedQuestionIds = (questions: any, fraction: any) => {
    const count = Math.floor(questions.length * fraction);
    return questions.sort(() => 0.5 - Math.random()).slice(0, count);
  };

  const campaignDomainQuizSets = await prisma.campaignDomainQuizSet.createMany({
    data: [
      {
        campaignId: campaign.id,
        domainId: (await prisma.domain.findFirst({ where: { code: "ko" } }))!
          .id,
        // campaignDomainId: (await prisma.campaignDomain.findFirst({
        //   where: {
        //     domainId: (await prisma.domain.findFirst({
        //       where: { code: "ko" },
        //     }))!.id,
        //   },
        // }))!.id,
        jobId: (await prisma.job.findFirst({ where: { name: "ff" } }))!.id,
        languageId: (await prisma.language.findFirst({
          where: { code: "ko" },
        }))!.id,
        questionIds: JSON.stringify(selectedQuestionIds(allKoQuestions, 0.75)),
        createrId: "test_admin_id",
        activityId: "test_activity_id",
      },
      {
        campaignId: campaign.id,
        domainId: (await prisma.domain.findFirst({ where: { code: "en" } }))!
          .id,
        // campaignDomainId: (await prisma.campaignDomain.findFirst({
        //   where: {
        //     domainId: (await prisma.domain.findFirst({
        //       where: { code: "en" },
        //     }))!.id,
        //   },
        // }))!.id,
        jobId: (await prisma.job.findFirst({ where: { name: "others" } }))!.id,
        languageId: (await prisma.language.findFirst({
          where: { code: "en" },
        }))!.id,
        questionIds: JSON.stringify(selectedQuestionIds(allQuestions, 0.75)),
        createrId: "test_admin_id",
        activityId: "test_activity_id",
      },
      {
        campaignId: campaign.id,
        domainId: (await prisma.domain.findFirst({ where: { code: "ja" } }))!
          .id,
        // campaignDomainId: (await prisma.campaignDomain.findFirst({
        //   where: {
        //     domainId: (await prisma.domain.findFirst({
        //       where: { code: "ja" },
        //     }))!.id,
        //   },
        // }))!.id,
        jobId: (await prisma.job.findFirst({ where: { name: "others" } }))!.id,
        languageId: (await prisma.language.findFirst({
          where: { code: "ja" },
        }))!.id,
        questionIds: JSON.stringify(selectedQuestionIds(allJaQuestions, 0.75)),
        createrId: "test_admin_id",
        activityId: "test_activity_id",
      },
    ],
  });

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

// async function main() {
//   console.log("Starting to seed data...");

//   // Create languages
//   const languages = [
//     { id: uuid.v4(), code: "en", name: "English" },
//     { id: uuid.v4(), code: "ko", name: "Korean" },
//     { id: uuid.v4(), code: "ja", name: "Japanese" },
//   ];

//   for (const language of languages) {
//     await prisma.language.create({
//       data: language,
//     });
//     console.log(`Created Language: ${language.name}`);
//   }

//   // Create countries
//   const countries = [
//     { id: uuid.v4(), code: "US", name: "United States" },
//     { id: uuid.v4(), code: "KR", name: "South Korea" },
//     { id: uuid.v4(), code: "JP", name: "Japan" },
//   ];

//   for (const country of countries) {
//     await prisma.country.create({
//       data: country,
//     });
//     console.log(`Created Country: ${country.name}`);
//   }

//   // Create CountryLanguage entries
//   const countryLanguageEntries = [
//     { countryCode: "US", languageCode: "en" },
//     { countryCode: "KR", languageCode: "ko" },
//     { countryCode: "JP", languageCode: "ja" },
//     { countryCode: "JP", languageCode: "en" }, // Japan supports English as well
//   ];

//   for (const entry of countryLanguageEntries) {
//     const country = countries.find((c) => c.code === entry.countryCode);
//     const language = languages.find((l) => l.code === entry.languageCode);

//     if (country && language) {
//       await prisma.countryLanguage.create({
//         data: {
//           id: uuid.v4(),
//           countryId: country.id,
//           languageId: language.id,
//           languageCode: language.code,
//         },
//       });
//       console.log(
//         `Linked Country (${country.name}) with Language (${language.name})`
//       );
//     }
//   }

//   // Create user jobs
//   const userJobs = [
//     { id: uuid.v4(), name: "ff", description: "group A" },
//     { id: uuid.v4(), name: "other", description: "group B" },
//   ];

//   for (const userJob of userJobs) {
//     await prisma.userJob.create({
//       data: userJob,
//     });
//     console.log(`Created User Job: ${userJob.name}`);
//   }

//   // Create a campaign
//   const campaignId = uuid.v4();
//   const campaign = await prisma.campaign.create({
//     data: {
//       id: campaignId,
//       name: "Simple Quiz Campaign",
//       description: "A campaign with a basic quiz structure.",
//     },
//   });

//   console.log(`Created Campaign: ${campaign.name}`);

//   // Add CountryActivity entries
//   const activityId = "test_activity_id";
//   for (const country of countries) {
//     await prisma.campaignActivity.create({
//       data: {
//         id: uuid.v4(),
//         campaignId: campaignId,
//         activityId: activityId,
//         countryId: country.id,
//         countryCode: country.code,
//         jobId: userJobs[0].id,
//         jobName: userJobs[0].name,
//       },
//     });
//     await prisma.campaignActivity.create({
//       data: {
//         id: uuid.v4(),
//         campaignId: campaignId,
//         activityId: activityId,
//         countryId: country.id,
//         countryCode: country.code,
//         jobId: userJobs[1].id,
//         jobName: userJobs[1].name,
//       },
//     });
//     console.log(
//       `Created CampaignActivity for Country: ${country.name}, Activity ID: ${activityId}`
//     );
//     break; // 하나의 activityId는 하나의 countryId만 매칭되므로, 한 번만 실행
//   }

//   console.log("Seeding completed!");

//   // Create a quiz set
//   // const quizSetId = uuid.v4();
//   // const quizSet = await prisma.quizSet.create({
//   //   data: {
//   //     id: quizSetId,
//   //     name: "General Knowledge Quiz",
//   //     description: "A quiz set to test general knowledge.",
//   //     campaignId: campaign.id,
//   //   },
//   // });

//   // console.log(`Created Quiz Set: ${quizSet.name}`);

//   // // Create translations for the quiz set
//   // const quizSetTranslations = [
//   //   { languageCode: "en", text: "General Knowledge Quiz" },
//   //   { languageCode: "ko", text: "일반 상식 퀴즈" },
//   //   { languageCode: "ja", text: "一般知識クイズ" },
//   // ];

//   // for (const translation of quizSetTranslations) {
//   //   await prisma.quizSetTranslation.create({
//   //     data: {
//   //       id: uuid.v4(),
//   //       languageCode: translation.languageCode,
//   //       text: translation.text,
//   //       quizSetId: quizSet.id,
//   //     },
//   //   });
//   // }

//   // Create 5 stages
//   const stages = [];
//   for (let i = 1; i <= 5; i++) {
//     const quizStageId = uuid.v4();
//     const stage = await prisma.quizStage.create({
//       data: {
//         id: quizStageId,
//         name: `Stage ${i}`,
//         order: i,
//         campaignId: campaign.id,
//       },
//     });
//     stages.push(stage);
//     console.log(`Created Stage: ${stage.name}`);
//   }

//   // Create random questions and options for each stage
//   for (const stage of stages) {
//     const questionCount = Math.floor(Math.random() * 4) + 5; // 5 to 8 questions
//     for (let i = 1; i <= questionCount; i++) {
//       const questionId = uuid.v4();
//       const question = await prisma.question.create({
//         data: {
//           id: questionId,
//           text: `Question ${i} in ${stage.name}`,
//           lifeCount: 3,
//           expiresIn: 60, // Expires in 60 seconds
//           quizStageId: stage.id,
//         },
//       });
//       console.log(`Created Question: ${question.text}`);

//       // Create translations for the question
//       const questionTranslations = [
//         { language: "en", text: `Question ${i} in ${stage.name}` },
//         { language: "ko", text: `스테이지 ${stage.order}의 문제 ${i}` },
//         { language: "ja", text: `ステージ${stage.order}の質問${i}` },
//       ];

//       for (const translation of questionTranslations) {
//         await prisma.questionTranslation.create({
//           data: {
//             id: uuid.v4(),
//             languageCode: translation.language,
//             text: translation.text,
//             questionId: questionId,
//           },
//         });
//       }

//       // Create 4 options for each question
//       for (let j = 1; j <= 4; j++) {
//         const optionId = uuid.v4();
//         const isCorrect = j === 1; // First option is correct
//         const option = await prisma.questionOption.create({
//           data: {
//             id: optionId,
//             text: `Option ${j} for Question ${i}`,
//             order: j,
//             questionId: questionId,
//           },
//         });
//         console.log(`Created Option: ${option.text} (Correct: ${isCorrect})`);

//         // Create translations for the option
//         const optionTranslations = [
//           { language: "en", text: `Option ${j} for Question ${i}` },
//           { language: "ko", text: `문제 ${i}의 옵션 ${j}` },
//           { language: "ja", text: `質問${i}の選択肢${j}` },
//         ];

//         for (const translation of optionTranslations) {
//           await prisma.questionOptionTranslation.create({
//             data: {
//               id: uuid.v4(),
//               languageCode: translation.language,
//               text: translation.text,
//               optionId: option.id,
//             },
//           });
//         }
//       }

//       // Assign the question to random countries and user jobs
//       for (const country of countries) {
//         for (const userJob of userJobs) {
//           const isEnabled = Math.random() > 0.5;
//           await prisma.questionUsage.create({
//             data: {
//               id: uuid.v4(),
//               countryId: country.id,
//               userJobId: userJob.id,
//               userJobName: userJob.name,
//               questionId: question.id,
//               isEnabled: isEnabled,
//             },
//           });

//           console.log(
//             `Assigned Question ${question.text} to Country ${country.name}, User Job ${userJob.name}`
//           );
//         }
//       }
//     }
//   }

//   console.log("Seeding completed!");
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
