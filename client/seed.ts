const { PrismaClient, QuestionType } = require("@prisma/client");
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
  const allQuestions: string[] = [];
  const allKoQuestions: string[] = [];
  const allJaQuestions: string[] = [];

  for (let i = 1; i <= 10; i++) {
    const question = await prisma.question.create({
      data: {
        text: `What is ${i}?`,
        timeLimitSeconds: 30,
        languageId: enLanguage.id,
        order: i,
        category: "test_category",
        specificFeature: "test_specificFeature",
        enabled: true,
        product: "test_product",
        questionType: QuestionType.SINGLE_CHOICE,
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
          category: "test_category",
          specificFeature: "test_specificFeature",
          enabled: true,
          product: "test_product",
          questionType: QuestionType.SINGLE_CHOICE,
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
        path: `${domain.code}_${jobs[0].code}_${lang.code}`,
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
        path: `${domain.code}_${jobs[1].code}_${lang.code}`,
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
        path: `${domain.code}_${jobs[0].code}_${lang.code}`,
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
  // for (const domain of domains) {
  //   const lang =
  //     domain.code === "ORG_502"
  //       ? koLanguage
  //       : domain.code === "NAT_2392"
  //       ? jaLanguage
  //       : enLanguage;
  //   const questions =
  //     domain.code === "ORG_502"
  //       ? allKoQuestions
  //       : domain.code === "NAT_2392"
  //       ? allJaQuestions
  //       : allQuestions;

  //   const campaignDomainQuizSet = await prisma.campaignDomainQuizSet.create({
  //     data: {
  //       path: `${domain.code}_${jobs[1].code}_${lang.code}`,
  //       campaignId: campaign.id,
  //       domainId: domain.id,
  //       languageId: lang.id,
  //       firstBadgeStage: 3,
  //       firstBadgeActivityId: optionalActivityId,
  //       lastBadgeActivityId: mainActivityId,
  //       createrId: "admin",
  //       jobId: jobs[1].id,
  //     },
  //   });

  //   console.log("campaignDomainQuizSet", campaignDomainQuizSet);

  //   for (let i = 1; i <= 4; i++) {
  //     const stageQuestionIds = questions
  //       .sort(() => 0.5 - Math.random())
  //       .slice(0, 3);

  //     await prisma.quizStage.create({
  //       data: {
  //         name: `Stage ${i} for ${domain.name}`,
  //         order: i,
  //         questionIds: JSON.stringify(stageQuestionIds),
  //         lifeCount: stageQuestionIds.length,
  //         campaignDomainQuizSetId: campaignDomainQuizSet.id,
  //       },
  //     });
  //   }
  // }

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
