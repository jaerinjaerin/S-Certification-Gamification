const { PrismaClient, Question } = require("@prisma/client");
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

  // Create Campaign
  const createSeeds = async () => {
    // Create Regions
    let filePath;
    let fileContent;

    filePath = path.join(
      process.cwd(),
      "data",
      "seeds",
      "grouped_domains.json"
    );

    fileContent = fs.readFileSync(filePath, "utf-8");
    const allDomains = JSON.parse(fileContent);

    const hqs = allDomains.hq;
    const regions = allDomains.regions;
    const subsidaries = allDomains.subsidaries;
    const domains = allDomains.domains;

    console.log("domains", domains);

    // 데이터 삽입
    await prisma.hq.createMany({
      data: hqs.map((region: any) => ({
        id: region.domainId.toString(),
        code: region.domainCode.toString(),
        name: region.domainName,
      })),
      // skipDuplicates: true, // 중복된 데이터를 무시
    });

    await prisma.region.createMany({
      data: regions.map((region: any) => ({
        id: region.domainId.toString(),
        code: region.domainCode.toString(),
        name: region.domainName,
        hqId:
          hqs
            .find((hq) => hq.domainId === region.parentDomainId)
            ?.domainId?.toString() ?? null,
      })),
      // skipDuplicates: true, // 중복된 데이터를 무시
    });

    await prisma.subsidary.createMany({
      data: subsidaries.map((subsidiary: any) => ({
        id: subsidiary.domainId.toString(),
        code: subsidiary.domainCode.toString(),
        name: subsidiary.domainName,
        regionId:
          regions
            .find((region) => region.domainId === subsidiary.parentDomainId)
            ?.domainId?.toString() ?? null,
      })),
      // skipDuplicates: true, // 중복된 데이터를 무시
    });

    const resultDomains = await prisma.domain.createMany({
      data: domains.map((country: any) => ({
        id: country.domainId.toString(),
        code: country.domainCode.toString(),
        name: country.domainName,
        subsidaryId:
          subsidaries
            .find(
              (subsidiary) => subsidiary.domainId === country.parentDomainId
            )
            ?.domainId?.toString() ?? null,
      })),
      // skipDuplicates: true, // 중복된 데이터를 무시
    });

    console.log("resultDomains", resultDomains);

    // Create Jobs
    filePath = path.join(process.cwd(), "data", "seeds", "jobs.json");

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
      // skipDuplicates: true, // 중복된 데이터를 무시
    });

    // Create Channel Segments
    filePath = path.join(
      process.cwd(),
      "data",
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
      // skipDuplicates: true, // 중복된 데이터를 무시
    });

    // Create Stores
    filePath = path.join(process.cwd(), "data", "seeds", "stores.json");

    // JSON 파일 읽기
    fileContent = fs.readFileSync(filePath, "utf-8");
    const stores = JSON.parse(fileContent);

    // 데이터 삽입
    await prisma.store.createMany({
      data: stores.map((store: any) => ({
        id: store.id,
        name: store.name,
      })),
      // skipDuplicates: true, // 중복된 데이터를 무시
    });

    // Create Languages
    filePath = path.join(process.cwd(), "data", "seeds", "languages.json");

    // JSON 파일 읽기
    fileContent = fs.readFileSync(filePath, "utf-8");
    const languages = JSON.parse(fileContent);

    // 데이터 삽입
    await prisma.language.createMany({
      data: languages.map((language: any) => ({
        code: language.code,
        name: language.name,
      })),
      // skipDuplicates: true, // 중복된 데이터를 무시
    });
  };

  const createCampaign = async () => {
    await prisma.campaign.create({
      data: {
        name: "S24",
        description: "A campaign spanning multiple languages",
        startedAt: new Date(),
        endedAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        createrId: "admin",
      },
    });
  };

  const createOriginQuizSet = async () => {
    const campaign = await prisma.campaign.findFirst();
    const folderPath = path.join(process.cwd(), "data", "questions");
    const files = fs.readdirSync(folderPath);

    console.log("files", files);

    // 먼저 HQ_NAT_0001 도메인 데이터를 처리
    const hqNatQuestions: any[] = [];
    for (const fileName of files.sort((a, b) =>
      a.includes("HQ_NAT_0001") ? -1 : 1
    )) {
      const filePath = path.join(folderPath, fileName);
      // const domainCode = fileName.split("|")[0];
      // const languageCode = fileName.split("|")[1].split(".")[0];
      // 확장자 제거
      const baseFileName = path.basename(fileName, path.extname(fileName));
      // 파일명 구조 파싱
      const [domainCode, languageCode] = baseFileName.split(".");

      const domainOrSubsidary =
        domainCode === "HQ_NAT_0001"
          ? await prisma.subsidary.findFirst({
              where: { code: domainCode },
            })
          : await prisma.domain.findFirst({
              where: { code: domainCode },
            });

      let language = await prisma.language.findFirst({
        where: { code: languageCode },
      });

      // if (!language)  {
      //   language = await prisma.language.findFirst({
      //     where: { code: "en-US" },
      //   });
      // }

      if (!domainOrSubsidary) {
        console.warn(`Domain not found for file: ${fileName}`);
        continue;
      }

      if (!language) {
        console.warn(`Language not found for file: ${fileName}`);
        continue;
      }

      const fileContent = fs.readFileSync(filePath, "utf-8");
      const questions = JSON.parse(fileContent);
      const createdQuestions: any[] = [];

      const charImages = [
        "/certification/s24/character_m_01.png",
        "/certification/s24/character_m_02.png",
        "/certification/s24/character_m_03.png",
        "/certification/s24/character_w_01.png",
        "/certification/s24/character_w_02.png",
      ];

      const bgImages = [
        "/certification/s24/bg_01.png",
        "/certification/s24/bg_02.png",
        "/certification/s24/bg_03.png",
        "/certification/s24/bg_04.png",
        "/certification/s24/bg_05.png",
      ];

      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const questionId = uuid.v4();

        const originalQuestionId =
          domainCode === "HQ_NAT_0001"
            ? questionId
            : hqNatQuestions.find(
                (hqQ) => hqQ.originalIndex === question.originQuestionIndex
              )?.id || null;

        const imageIndex = i % charImages.length;
        const item = await prisma.question.create({
          data: {
            id: questionId,
            text: question.text.toString(),
            timeLimitSeconds: parseInt(question.timeLimitSeconds),
            languageId: language.id,
            originalQuestionId,
            originalIndex: question.originQuestionIndex,
            category: question.category,
            specificFeature: question.specificFeature ?? "",
            enabled: question.enabled === 1 || question.enabled === "1",
            product: question.product,
            questionType: question.questionType,
            order: question.orderInStage ?? 0,
            backgroundImageUrl: bgImages[imageIndex],
            characterImageUrl: charImages[imageIndex],
          },
        });

        console.log("item", item);

        createdQuestions.push(item);
        if (domainCode === "HQ_NAT_0001") {
          hqNatQuestions.push(item);
        }

        for (let j = 0; j < question.options.length; j++) {
          const option = question.options[j];
          await prisma.questionOption.create({
            data: {
              text: option.text.toString(),
              order: j,
              questionId,
              isCorrect:
                option.answerStatus === 1 || option.answerStatus === "1",
              languageId: language.id,
            },
          });
        }
      }

      const quizSet = await prisma.quizSet.create({
        data: {
          campaignId: campaign.id,
          domainId: domainCode === "HQ_NAT_0001" ? null : domainOrSubsidary.id,
          subsidaryId:
            domainCode === "HQ_NAT_0001" ? domainOrSubsidary.id : null,
          jobCodes: ["ff", "fsm"],
          createrId: "seed",
        },
      });

      console.log("quizSet", quizSet);

      const stages = [
        ...new Set(questions.map((question) => question.stage)),
      ].sort();

      for (let i = 0; i < stages.length; i++) {
        const stage: any = stages[i];
        const stageQuestions = questions.filter(
          (question) =>
            question.stage === stage &&
            (question.enabled === 1 || question.enabled === "1")
        );

        stageQuestions.sort((a, b) => a.orderInStage - b.orderInStage);

        const questionIds = stageQuestions.map((question) => {
          if (domainCode === "HQ_NAT_0001") {
            const q: any = createdQuestions.find(
              (q: any) => q.originalIndex === question.originQuestionIndex
            );
            return q?.id;
          } else {
            const hqQuestion: any = hqNatQuestions.find(
              (hqQ: any) => hqQ.originalIndex === question.originQuestionIndex
            );
            return hqQuestion?.id;
          }
        });

        const isLastStage = i === stages.length - 1;
        await prisma.quizStage.create({
          data: {
            name: stage.toString(),
            order: stage,
            questionIds,
            lifeCount: stageQuestions.length,
            quizSetId: quizSet.id,
            isBadgeStage: isLastStage,
            badgeActivityId: isLastStage ? "249587" : null, // 250659, 250642, 250639, 250641
            badgeImageUrl: isLastStage
              ? "/certification/s24/badgeFF.png"
              : null,
            // backgroundImageUrl: bgImages[i],
            // characterImageUrl: charImages[i],
          },
        });
      }
    }
  };

  await createSeeds();
  await createCampaign();
  await createOriginQuizSet();

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
