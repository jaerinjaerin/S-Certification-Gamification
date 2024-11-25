const { PrismaClient } = require("@prisma/client");
const uuid = require("uuid");

const prisma = new PrismaClient();

// 실제 url: https://quiz.samsungplus.net/s24/{domainCode}_{job}_{languageCode}
// test url: http://localhost:3000/s24/{domain_code}/{job_name}/{lagnuage_code}
// test url: http://localhost:3000/s24/ORG_502_ff_ko

async function main() {
  const mainActivityId = "test_main_activity_id";
  const optionalActivityId = "test_optional_activity_id";

  // Create Languages
  const languages = await prisma.language.createMany({
    data: [
      { code: "en", name: "English" },
      { code: "ko", name: "Korean" },
      { code: "ja", name: "Japanese" },
    ],
  });

  // Create Jobs
  await prisma.job.createMany({
    data: [
      { code: "ff", name: "ff", description: "FF Job" },
      { code: "fsm", name: "fsm", description: "FSM Job" },
      {
        code: "fsm",
        name: "FSM(C&R)",
        description: "FSM(C&R)",
      },
      { code: "fsm", name: "SES", description: "ses" },
    ],
  });

  const jobs = await prisma.job.findMany();

  const channelSegments = await prisma.channelSegment.createMany({
    data: [
      { name: "Carrier" },
      { name: "Retailer (MM/IT/Traditional etc)" },
      { name: "Retailer (Pure player)" },
      { name: "samsung.com" },
      { name: "others" },
    ],
  });

  const channelSegmentRecords = await prisma.channelSegment.findMany();

  const carrier = channelSegmentRecords.find((c: any) => c.name === "Carrier");
  const retailerMM = channelSegmentRecords.find(
    (c: any) => c.name === "Retailer (MM/IT/Traditional etc)"
  );
  const retailerPure = channelSegmentRecords.find(
    (c: any) => c.name === "Retailer (Pure player)"
  );
  const samsungCom = channelSegmentRecords.find(
    (c: any) => c.name === "samsung.com"
  );
  const others = channelSegmentRecords.find((c: any) => c.name === "others");

  await prisma.salesFormat.createMany({
    data: [
      // Carrier
      {
        storeType: "Off line Store",
        // jobCode: "FSM(C&R)",
        jobId: jobs.find((j: any) => j.code === "fsm").id,
        channelSegmentId: carrier.id,
      },
      {
        storeType: "On line Store",
        // jobCode: "FSM(C&R)",
        jobId: jobs.find((j: any) => j.code === "fsm").id,
        channelSegmentId: carrier.id,
      },
      {
        storeType: "contact(Call center)",
        // jobCode: "FSM(C&R)",
        jobId: jobs.find((j: any) => j.code === "fsm").id,
        channelSegmentId: carrier.id,
      },
      {
        storeType: "SES",
        // jobCode: "SES",
        jobId: jobs.find((j: any) => j.code === "fsm").id,
        channelSegmentId: carrier.id,
      },
      {
        storeType: "others",
        // jobCode: "FSM(C&R)",
        jobId: jobs.find((j: any) => j.code === "fsm").id,
        channelSegmentId: carrier.id,
      },

      // Retailer (MM/IT/Traditional etc)
      {
        storeType: "Off line Store",
        // jobCode: "FSM",
        jobId: jobs.find((j: any) => j.code === "fsm").id,
        channelSegmentId: retailerMM.id,
      },
      {
        storeType: "On line Store",
        // jobCode: "FSM",
        jobId: jobs.find((j: any) => j.code === "fsm").id,
        channelSegmentId: retailerMM.id,
      },
      {
        storeType: "contact(Call center)",
        // jobCode: "FSM",
        jobId: jobs.find((j: any) => j.code === "fsm").id,
        channelSegmentId: retailerMM.id,
      },
      {
        storeType: "SES",
        // jobCode: "SES",
        jobId: jobs.find((j: any) => j.code === "fsm").id,
        channelSegmentId: retailerMM.id,
      },
      {
        storeType: "others",
        // jobCode: "FSM",
        jobId: jobs.find((j: any) => j.code === "fsm").id,
        channelSegmentId: retailerMM.id,
      },

      // Retailer (Pure player)
      {
        storeType: "Off line Store",
        // jobCode: "FSM",
        jobId: jobs.find((j: any) => j.code === "fsm").id,
        channelSegmentId: retailerPure.id,
      },
      {
        storeType: "On line Store",
        // jobCode: "FSM",
        jobId: jobs.find((j: any) => j.code === "fsm").id,
        channelSegmentId: retailerPure.id,
      },
      {
        storeType: "contact(Call center)",
        // jobCode: "FSM",
        jobId: jobs.find((j: any) => j.code === "fsm").id,
        channelSegmentId: retailerPure.id,
      },
      {
        storeType: "SES",
        // jobCode: "SES",
        jobId: jobs.find((j: any) => j.code === "fsm").id,
        channelSegmentId: retailerPure.id,
      },
      {
        storeType: "others",
        // jobCode: "FSM",
        jobId: jobs.find((j: any) => j.code === "fsm").id,
        channelSegmentId: retailerPure.id,
      },

      // samsung.com
      {
        storeType: "Off line Store",
        // jobCode: "FF",
        jobId: jobs.find((j: any) => j.code === "ff").id,
        channelSegmentId: samsungCom.id,
      },
      {
        storeType: "On line Store",
        // jobCode: "FF",
        jobId: jobs.find((j: any) => j.code === "ff").id,
        channelSegmentId: samsungCom.id,
      },
      {
        storeType: "contact(Call center)",
        // jobCode: "FF",
        jobId: jobs.find((j: any) => j.code === "ff").id,
        channelSegmentId: samsungCom.id,
      },
      {
        storeType: "SES",
        // jobCode: "SES",
        jobId: jobs.find((j: any) => j.code === "fsm").id,
        channelSegmentId: samsungCom.id,
      },
      {
        storeType: "others",
        // jobCode: "FF",
        jobId: jobs.find((j: any) => j.code === "ff").id,
        channelSegmentId: samsungCom.id,
      },

      // others
      {
        storeType: "others",
        // jobCode: "FSM",
        jobId: jobs.find((j: any) => j.code === "fsm").id,
        channelSegmentId: others.id,
      },
    ],
  });

  const languageRecords = await prisma.language.findMany();
  const enLanguage = languageRecords.find((lang: any) => lang.code === "en");
  const koLanguage = languageRecords.find((lang: any) => lang.code === "ko");
  const jaLanguage = languageRecords.find((lang: any) => lang.code === "ja");

  // Create Domains
  await prisma.domain.createMany({
    data: [
      {
        name: "US",
        code: "us",
        channelSegmentIds: `${carrier.id},${samsungCom.id},${retailerPure.id}`,
      },
      {
        name: "Korea",
        code: "ORG_502",
        channelSegmentIds: `${carrier.id},${samsungCom.id},${retailerPure.id}`,
      },
      {
        name: "Japan",
        code: "NAT_2392",
        channelSegmentIds: `${carrier.id},${retailerPure.id}`,
      },
    ],
  });

  const domains = await prisma.domain.findMany();

  // Create Campaign
  const campaign = await prisma.campaign.create({
    data: {
      name: "S24",
      description: "A campaign spanning multiple languages",
      startedAt: new Date(),
      endedAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      createrId: "admin",
    },
  });

  // Create Questions and Options in English
  const allQuestions = [];
  const allKoQuestions: any = [];
  const allJaQuestions: any = [];

  for (let i = 1; i <= 10; i++) {
    const question = await prisma.question.create({
      data: {
        text: `What is ${i}?`,
        timeLimitSeconds: 30,
        languageId: enLanguage.id,
        order: i,
      },
    });

    allQuestions.push(question.id);

    for (let j = 1; j <= 4; j++) {
      await prisma.questionOption.create({
        data: {
          text: `Option ${j} for Question ${i}`,
          order: j,
          questionId: question.id,
          isCorrect: j === 1,
          languageId: enLanguage.id,
        },
      });
    }

    // Translations for Korean and Japanese
    const translations = [
      { code: "ko", lang: koLanguage, list: allKoQuestions },
      { code: "ja", lang: jaLanguage, list: allJaQuestions },
    ];

    for (const { lang, list } of translations) {
      const translatedQuestion = await prisma.question.create({
        data: {
          text: `Translated What is ${i} in ${lang.name}`,
          timeLimitSeconds: 30,
          languageId: lang.id,
          parentId: question.id,
          order: i,
        },
      });

      list.push(translatedQuestion.id);

      const options = await prisma.questionOption.findMany({
        where: { questionId: question.id },
      });

      for (const option of options) {
        await prisma.questionOption.create({
          data: {
            text: `Translated ${option.text} in ${lang.name}`,
            order: option.order,
            questionId: translatedQuestion.id,
            isCorrect: option.isCorrect,
            languageId: lang.id,
          },
        });
      }
    }
  }

  // Create CampaignDomainQuizSet and QuizStages
  // for ff user
  for (const domain of domains) {
    const lang =
      domain.code === "ORG_502"
        ? koLanguage
        : domain.code === "ja"
        ? jaLanguage
        : enLanguage;
    const questions =
      domain.code === "ORG_502"
        ? allKoQuestions
        : domain.code === "ja"
        ? allJaQuestions
        : allQuestions;

    const campaignDomainQuizSet = await prisma.campaignDomainQuizSet.create({
      data: {
        campaignId: campaign.id,
        domainId: domain.id,
        jobId: jobs[0].id, // Assigning the first job for simplicity
        languageId: lang.id,
        lastBadgeActivityId: mainActivityId,
        createrId: "admin",
      },
    });

    for (let i = 1; i <= 4; i++) {
      const stageQuestionIds = questions
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      await prisma.quizStage.create({
        data: {
          name: `Stage ${i} for ${domain.name}`,
          order: i,
          questionIds: JSON.stringify(stageQuestionIds),
          lifeCount: stageQuestionIds.length,
          campaignDomainQuizSetId: campaignDomainQuizSet.id,
        },
      });
    }
  }

  // for fsm user
  for (const domain of domains) {
    const lang =
      domain.code === "ORG_502"
        ? koLanguage
        : domain.code === "NAT_2392"
        ? jaLanguage
        : enLanguage;
    const questions =
      domain.code === "ORG_502"
        ? allKoQuestions
        : domain.code === "NAT_2392"
        ? allJaQuestions
        : allQuestions;

    const campaignDomainQuizSet = await prisma.campaignDomainQuizSet.create({
      data: {
        campaignId: campaign.id,
        domainId: domain.id,
        jobId: jobs[1].id, // Assigning the first job for simplicity
        languageId: lang.id,
        firstBadgeStage: 3,
        firstBadgeActivityId: optionalActivityId,
        lastBadgeActivityId: mainActivityId,
        createrId: "admin",
      },
    });

    for (let i = 1; i <= 4; i++) {
      const stageQuestionIds = questions
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      await prisma.quizStage.create({
        data: {
          name: `Stage ${i} for ${domain.name}`,
          order: i,
          questionIds: JSON.stringify(stageQuestionIds),
          lifeCount: stageQuestionIds.length,
          campaignDomainQuizSetId: campaignDomainQuizSet.id,
        },
      });
    }
  }

  // for ff guest
  for (const domain of domains) {
    const lang =
      domain.code === "ORG_502"
        ? koLanguage
        : domain.code === "NAT_2392"
        ? jaLanguage
        : enLanguage;
    const questions =
      domain.code === "ORG_502"
        ? allKoQuestions
        : domain.code === "NAT_2392"
        ? allJaQuestions
        : allQuestions;

    const campaignDomainQuizSet = await prisma.campaignDomainQuizSet.create({
      data: {
        campaignId: campaign.id,
        domainId: domain.id,
        jobId: jobs[0].id, // Assigning the first job for simplicity
        languageId: lang.id,
        lastBadgeActivityId: mainActivityId,
        createrId: "admin",
      },
    });

    for (let i = 1; i <= 4; i++) {
      const stageQuestionIds = questions
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      await prisma.quizStage.create({
        data: {
          name: `Stage ${i} for ${domain.name}`,
          order: i,
          questionIds: JSON.stringify(stageQuestionIds),
          lifeCount: stageQuestionIds.length,
          campaignDomainQuizSetId: campaignDomainQuizSet.id,
        },
      });
    }
  }

  // for fcm guest
  for (const domain of domains) {
    const lang =
      domain.code === "ORG_502"
        ? koLanguage
        : domain.code === "NAT_2392"
        ? jaLanguage
        : enLanguage;
    const questions =
      domain.code === "ORG_502"
        ? allKoQuestions
        : domain.code === "NAT_2392"
        ? allJaQuestions
        : allQuestions;

    const campaignDomainQuizSet = await prisma.campaignDomainQuizSet.create({
      data: {
        campaignId: campaign.id,
        domainId: domain.id,
        languageId: lang.id,
        firstBadgeStage: 3,
        firstBadgeActivityId: optionalActivityId,
        lastBadgeActivityId: mainActivityId,
        createrId: "admin",
        jobId: jobs[1].id,
      },
    });

    for (let i = 1; i <= 4; i++) {
      const stageQuestionIds = questions
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      await prisma.quizStage.create({
        data: {
          name: `Stage ${i} for ${domain.name}`,
          order: i,
          questionIds: JSON.stringify(stageQuestionIds),
          lifeCount: stageQuestionIds.length,
          campaignDomainQuizSetId: campaignDomainQuizSet.id,
        },
      });
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
