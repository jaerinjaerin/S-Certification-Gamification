const { PrismaClient, QuestionType } = require("@prisma/client");
const uuid = require("uuid");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

// 실제 url: https://quiz.samsungplus.net/s24/{domainCode}_{job}_{languageCode}
// test url: http://localhost:3000/s24/{domain_code}/{job_name}/{lagnuage_code}
// test url: http://localhost:3000/s24/ORG_502_ff_ko

async function main() {
  // const filePath = path.join(
  //   __dirname,
  //   "assets/excels/sample|NAT_021502|fi.xlsx"
  // );

  // const filePath = path.join(
  //   process.cwd(),
  //   "public",
  //   "assets",
  //   "excels",
  //   "sample|NAT_021502|fi.xlsx"
  // );

  // // 엑셀 파일 읽기
  // const workbook = XLSX.readFile(filePath);

  // // 첫 번째 시트 가져오기
  // const sheetName = workbook.SheetNames[0];
  // const sheet = workbook.Sheets[sheetName];

  // // JSON 데이터로 변환
  // const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  // console.log("jsonData", jsonData);

  // // Question 중심으로 데이터 필터링
  // const questions = jsonData
  //   .map((row) => ({
  //     question: row["Question"] || "",
  //     answer1: row["Answer1"] || null,
  //     answer2: row["Answer2"] || null,
  //     questionType: row["QuestionType"] || null,
  //   }))
  //   .filter((row) => row.question);

  // return;

  const mainActivityId = "test_main_activity_id";
  const optionalActivityId = "test_optional_activity_id";

  // Create Campaign
  await prisma.campaign.create({
    data: {
      name: "S24",
      description: "A campaign spanning multiple languages",
      startedAt: new Date(),
      endedAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      createrId: "admin",
    },
  });

  // Create Domains
  let filePath = path.join(
    process.cwd(),
    "public",
    "assets",
    "seeds",
    "domains.json"
  );

  // JSON 파일 읽기
  let fileContent = fs.readFileSync(filePath, "utf-8");
  const domains = JSON.parse(fileContent);

  // 데이터 삽입
  await prisma.domain.createMany({
    data: domains.map((domain: any) => ({
      name: domain.name,
      code: domain.code,
      region: domain.region,
      subsidary: domain.subsidary,
    })),
    skipDuplicates: true, // 중복된 데이터를 무시
  });

  // Create Jobs
  filePath = path.join(process.cwd(), "public", "assets", "seeds", "jobs.json");

  // JSON 파일 읽기
  fileContent = fs.readFileSync(filePath, "utf-8");
  const jobs = JSON.parse(fileContent);

  // 데이터 삽입
  await prisma.job.createMany({
    data: jobs.map((job: any) => ({
      id: job.id,
      code: job.code,
      group: job.group,
      name: job.name,
      description: job.description,
    })),
    skipDuplicates: true, // 중복된 데이터를 무시
  });

  // Create Channel Segments
  filePath = path.join(
    process.cwd(),
    "public",
    "assets",
    "seeds",
    "channel_segments.json"
  );

  // JSON 파일 읽기
  fileContent = fs.readFileSync(filePath, "utf-8");
  const channelSegments = JSON.parse(fileContent);

  // 데이터 삽입
  await prisma.channelSegment.createMany({
    data: channelSegments.map((channel: any) => ({
      id: channel.id,
      name: channel.name,
    })),
    skipDuplicates: true, // 중복된 데이터를 무시
  });

  // Create Stores
  filePath = path.join(
    process.cwd(),
    "public",
    "assets",
    "seeds",
    "stores.json"
  );

  // JSON 파일 읽기
  fileContent = fs.readFileSync(filePath, "utf-8");
  const stores = JSON.parse(fileContent);

  // 데이터 삽입
  await prisma.store.createMany({
    data: stores.map((store: any) => ({
      id: store.id,
      name: store.name,
    })),
    skipDuplicates: true, // 중복된 데이터를 무시
  });

  // Create Languages
  filePath = path.join(
    process.cwd(),
    "public",
    "assets",
    "seeds",
    "languages.json"
  );

  // JSON 파일 읽기
  fileContent = fs.readFileSync(filePath, "utf-8");
  const languages = JSON.parse(fileContent);

  // 데이터 삽입
  await prisma.language.createMany({
    data: languages.map((language: any) => ({
      code: language.code,
      name: language.name,
    })),
    skipDuplicates: true, // 중복된 데이터를 무시
  });

  // const filePath = path.join(
  //   process.cwd(),
  //   "public",
  //   "assets",
  //   "excels",
  //   "sample|NAT_021502|fi.xlsx"
  // );

  // // Create Languages
  // const languages = await prisma.language.createMany({
  //   data: [
  //     { code: "en", name: "English" },
  //     { code: "ko", name: "Korean" },
  //     { code: "ja", name: "Japanese" },
  //   ],
  // });

  // ## Jobs
  /*
    1: FSM(FSC) Store Sales
    2: FSM(FSC) e-promoter
    3: FSM(FSC) Contact-Center agent (Call Center Agent)
    4: FF MX promoter
    5: FF MX merchandiser
    6: FF MX trainer
    7: others (Not obligate to learn like a Management)
    8: FSM (others)
    9: FF (others)
    10: Customer Services

    1~7 S+ 사용 유저
    8~10 S+ 미사용 유저
  */
  // await prisma.job.createMany({
  //   data: [
  //     {
  //       id: "1",
  //       code: "fsm",
  //       group: "fsm",
  //       name: "FSM(FSC) Store Sales",
  //       description: "FSM(FSC)",
  //     },
  //     {
  //       id: "2",
  //       code: "fsm",
  //       group: "fsm",
  //       name: "FSM(FSC) e-promoter",
  //       description: "FSM(FSC)",
  //     },
  //     {
  //       id: "3",
  //       code: "fsm",
  //       group: "fsm",
  //       name: "FSM(FSC) Contact-Center agent",
  //       description: "FSM(FSC)",
  //     },
  //     {
  //       id: "4",
  //       code: "ff",
  //       group: "ff",
  //       name: "FF MX promoter",
  //       description: "FF",
  //     },
  //     {
  //       id: "5",
  //       code: "ff",
  //       group: "ff",
  //       name: "FF MX merchandiser",
  //       description: "FF",
  //     },
  //     {
  //       id: "6",
  //       code: "ff",
  //       group: "ff",
  //       name: "FF MX trainer",
  //       description: "FF",
  //     },
  //     {
  //       id: "7",
  //       code: "fsm",
  //       group: "fsm",
  //       name: "others",
  //       description: "FSM(FSC)",
  //     },
  //     { id: "8", code: "fsm", group: "fsm", name: "FSM (others)" },
  //     { id: "9", code: "ff", group: "ff", name: "FF (others)" },
  //     { id: "10", code: "fsm", group: "fsm", name: "Customer Services" },
  //   ],
  // });

  // // const jobs = await prisma.job.findMany();

  // // ## Channel Segments
  // /*
  //   1: Carrier(Operator)
  //   2: Retailer (MM/IT/Traditaionl etc)
  //   3: Retailer (Pure plyer)
  //   4: samsung.com
  //   5: others
  // */
  // await prisma.channelSegment.createMany({
  //   data: [
  //     { id: "1", name: "Carrier(Operator)" },
  //     { id: "2", name: "Retailer (MM/IT/Traditaionl etc)" },
  //     { id: "3", name: "Retailer (Pure plyer)" },
  //     { id: "4", name: "samsung.com" },
  //     { id: "5", name: "others" },
  //   ],
  // });

  // // ## Store Types
  // /*
  //   1: offline-store
  //   2: online-store
  //   3: contact-center (call-center)
  //   4: SES
  //   5: others
  // */
  // await prisma.store.createMany({
  //   data: [
  //     { id: "1", name: "offline-store" },
  //     { id: "2", name: "online-store" },
  //     { id: "3", name: "contact-center" },
  //     { id: "4", name: "SES" },
  //     { id: "5", name: "others" },
  //   ],
  // });

  // const channelSegmentRecords = await prisma.channelSegment.findMany();

  // const carrier = channelSegmentRecords.find((c: any) => c.name === "Carrier");
  // const retailerMM = channelSegmentRecords.find(
  //   (c: any) => c.name === "Retailer (MM/IT/Traditional etc)"
  // );
  // const retailerPure = channelSegmentRecords.find(
  //   (c: any) => c.name === "Retailer (Pure player)"
  // );
  // const samsungCom = channelSegmentRecords.find(
  //   (c: any) => c.name === "samsung.com"
  // );
  // const others = channelSegmentRecords.find((c: any) => c.name === "others");

  // await prisma.salesFormat.createMany({
  //   data: [
  //     // Carrier
  //     {
  //       storeType: "Off line Store",
  //       // jobCode: "FSM(C&R)",
  //       jobId: jobs.find((j: any) => j.code === "fsm").id,
  //       channelSegmentId: carrier.id,
  //     },
  //     {
  //       storeType: "On line Store",
  //       // jobCode: "FSM(C&R)",
  //       jobId: jobs.find((j: any) => j.code === "fsm").id,
  //       channelSegmentId: carrier.id,
  //     },
  //     {
  //       storeType: "contact(Call center)",
  //       // jobCode: "FSM(C&R)",
  //       jobId: jobs.find((j: any) => j.code === "fsm").id,
  //       channelSegmentId: carrier.id,
  //     },
  //     {
  //       storeType: "SES",
  //       // jobCode: "SES",
  //       jobId: jobs.find((j: any) => j.code === "fsm").id,
  //       channelSegmentId: carrier.id,
  //     },
  //     {
  //       storeType: "others",
  //       // jobCode: "FSM(C&R)",
  //       jobId: jobs.find((j: any) => j.code === "fsm").id,
  //       channelSegmentId: carrier.id,
  //     },

  //     // Retailer (MM/IT/Traditional etc)
  //     {
  //       storeType: "Off line Store",
  //       // jobCode: "FSM",
  //       jobId: jobs.find((j: any) => j.code === "fsm").id,
  //       channelSegmentId: retailerMM.id,
  //     },
  //     {
  //       storeType: "On line Store",
  //       // jobCode: "FSM",
  //       jobId: jobs.find((j: any) => j.code === "fsm").id,
  //       channelSegmentId: retailerMM.id,
  //     },
  //     {
  //       storeType: "contact(Call center)",
  //       // jobCode: "FSM",
  //       jobId: jobs.find((j: any) => j.code === "fsm").id,
  //       channelSegmentId: retailerMM.id,
  //     },
  //     {
  //       storeType: "SES",
  //       // jobCode: "SES",
  //       jobId: jobs.find((j: any) => j.code === "fsm").id,
  //       channelSegmentId: retailerMM.id,
  //     },
  //     {
  //       storeType: "others",
  //       // jobCode: "FSM",
  //       jobId: jobs.find((j: any) => j.code === "fsm").id,
  //       channelSegmentId: retailerMM.id,
  //     },

  //     // Retailer (Pure player)
  //     {
  //       storeType: "Off line Store",
  //       // jobCode: "FSM",
  //       jobId: jobs.find((j: any) => j.code === "fsm").id,
  //       channelSegmentId: retailerPure.id,
  //     },
  //     {
  //       storeType: "On line Store",
  //       // jobCode: "FSM",
  //       jobId: jobs.find((j: any) => j.code === "fsm").id,
  //       channelSegmentId: retailerPure.id,
  //     },
  //     {
  //       storeType: "contact(Call center)",
  //       // jobCode: "FSM",
  //       jobId: jobs.find((j: any) => j.code === "fsm").id,
  //       channelSegmentId: retailerPure.id,
  //     },
  //     {
  //       storeType: "SES",
  //       // jobCode: "SES",
  //       jobId: jobs.find((j: any) => j.code === "fsm").id,
  //       channelSegmentId: retailerPure.id,
  //     },
  //     {
  //       storeType: "others",
  //       // jobCode: "FSM",
  //       jobId: jobs.find((j: any) => j.code === "fsm").id,
  //       channelSegmentId: retailerPure.id,
  //     },

  //     // samsung.com
  //     {
  //       storeType: "Off line Store",
  //       // jobCode: "FF",
  //       jobId: jobs.find((j: any) => j.code === "ff").id,
  //       channelSegmentId: samsungCom.id,
  //     },
  //     {
  //       storeType: "On line Store",
  //       // jobCode: "FF",
  //       jobId: jobs.find((j: any) => j.code === "ff").id,
  //       channelSegmentId: samsungCom.id,
  //     },
  //     {
  //       storeType: "contact(Call center)",
  //       // jobCode: "FF",
  //       jobId: jobs.find((j: any) => j.code === "ff").id,
  //       channelSegmentId: samsungCom.id,
  //     },
  //     {
  //       storeType: "SES",
  //       // jobCode: "SES",
  //       jobId: jobs.find((j: any) => j.code === "fsm").id,
  //       channelSegmentId: samsungCom.id,
  //     },
  //     {
  //       storeType: "others",
  //       // jobCode: "FF",
  //       jobId: jobs.find((j: any) => j.code === "ff").id,
  //       channelSegmentId: samsungCom.id,
  //     },

  //     // others
  //     {
  //       storeType: "others",
  //       // jobCode: "FSM",
  //       jobId: jobs.find((j: any) => j.code === "fsm").id,
  //       channelSegmentId: others.id,
  //     },
  //   ],
  // });

  // const languageRecords = await prisma.language.findMany();
  // const enLanguage = languageRecords.find((lang: any) => lang.code === "en");
  // const koLanguage = languageRecords.find((lang: any) => lang.code === "ko");
  // const jaLanguage = languageRecords.find((lang: any) => lang.code === "ja");

  // // // Create Domains
  // // await prisma.domain.createMany({
  // //   data: [
  // //     {
  // //       name: "US",
  // //       code: "us",
  // //       channelSegmentIds: `${carrier.id},${samsungCom.id},${retailerPure.id}`,
  // //     },
  // //     {
  // //       name: "Korea",
  // //       code: "ORG_502",
  // //       channelSegmentIds: `${carrier.id},${samsungCom.id},${retailerPure.id}`,
  // //     },
  // //     {
  // //       name: "Japan",
  // //       code: "NAT_2392",
  // //       channelSegmentIds: `${carrier.id},${retailerPure.id}`,
  // //     },
  // //   ],
  // // });

  // // const domains = await prisma.domain.findMany();

  // // Create Questions and Options in English
  // const allQuestions: string[] = [];
  // const allKoQuestions: string[] = [];
  // const allJaQuestions: string[] = [];

  // for (let i = 1; i <= 10; i++) {
  //   const questionId = uuid.v4();
  //   const question = await prisma.question.create({
  //     data: {
  //       id: questionId,
  //       originalQuestionId: questionId,
  //       text: `What is ${i}?`,
  //       timeLimitSeconds: 30,
  //       languageId: enLanguage.id,
  //       order: i,
  //       category: "test_category",
  //       specificFeature: "test_specificFeature",
  //       enabled: true,
  //       product: "test_product",
  //       questionType: QuestionType.SINGLE_CHOICE,
  //     },
  //   });

  //   allQuestions.push(question.id);

  //   for (let j = 1; j <= 4; j++) {
  //     await prisma.questionOption.create({
  //       data: {
  //         text: `Option ${j} for Question ${i}`,
  //         order: j,
  //         questionId: question.id,
  //         isCorrect: j === 1,
  //         languageId: enLanguage.id,
  //       },
  //     });
  //   }

  //   // Translations for Korean and Japanese
  //   const translations = [
  //     { code: "ko", lang: koLanguage, list: allKoQuestions },
  //     { code: "ja", lang: jaLanguage, list: allJaQuestions },
  //   ];

  //   for (const { lang, list } of translations) {
  //     const translatedQuestion = await prisma.question.create({
  //       data: {
  //         text: `Translated What is ${i} in ${lang.name}`,
  //         timeLimitSeconds: 30,
  //         languageId: lang.id,
  //         originalQuestionId: question.id,
  //         order: i,
  //         category: "test_category",
  //         specificFeature: "test_specificFeature",
  //         enabled: true,
  //         product: "test_product",
  //         questionType: QuestionType.SINGLE_CHOICE,
  //       },
  //     });

  //     list.push(translatedQuestion.id);

  //     const options = await prisma.questionOption.findMany({
  //       where: { questionId: question.id },
  //     });

  //     for (const option of options) {
  //       await prisma.questionOption.create({
  //         data: {
  //           text: `Translated ${option.text} in ${lang.name}`,
  //           order: option.order,
  //           questionId: translatedQuestion.id,
  //           isCorrect: option.isCorrect,
  //           languageId: lang.id,
  //         },
  //       });
  //     }
  //   }
  // }

  // // Create CampaignDomainQuizSet and QuizStages
  // // for ff user
  // for (const domain of domains) {
  //   // const lang = koLanguage;
  //   // domain.code === "ORG_502"
  //   //   ? koLanguage
  //   //   : domain.code === "NAT_2392"
  //   //   ? jaLanguage
  //   //   : enLanguage;
  //   // const questions =
  //   //   domain.code === "ORG_502"
  //   //     ? allKoQuestions
  //   //     : domain.code === "ja"
  //   //     ? allJaQuestions
  //   //     : allQuestions;

  //   const quizSet = await prisma.quizSet.create({
  //     data: {
  //       // path: `${domain.code}_${jobs[0].code}_${lang.code}`,
  //       // paths: [
  //       //   `${domain.code}_${jobs[0].code}`,
  //       //   `${domain.code}_${jobs[1].code}`,
  //       // ],
  //       campaignId: campaign.id,
  //       domainId: domain.id,
  //       // jobIds: [jobs[0].id, jobs[1].id],
  //       jobCodes: ["ff", "fsm"],
  //       // languageId: lang.id,
  //       // lastBadgeActivityId: mainActivityId,
  //       // badgeStages: [4],
  //       // badgeActivityIds: [mainActivityId],
  //       createrId: "admin",
  //     },
  //   });

  //   for (let i = 1; i <= 4; i++) {
  //     const stageQuestionIds = allQuestions
  //       .sort(() => 0.5 - Math.random())
  //       .slice(0, 3);

  //     await prisma.quizStage.create({
  //       data: {
  //         name: `Stage ${i}`,
  //         order: i,
  //         questionIds: stageQuestionIds,
  //         lifeCount: stageQuestionIds.length,
  //         quizSetId: quizSet.id,
  //         isBadgeStage: i === 4,
  //         badgeActivityId: i === 4 ? mainActivityId : null,
  //       },
  //     });
  //   }
  // }

  // console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
