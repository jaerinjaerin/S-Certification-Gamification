const { PrismaClient, Question } = require("@prisma/client");
const uuid = require("uuid");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

// 실제 url: https://quiz.samsungplus.net/s24/{domainCode}_{job}_{languageCode}
// test url: http://localhost:3000/s24/{domain_code}/{job_name}/{lagnuage_code}
// test url: http://localhost:3000/s24/ORG_502_ff_ko

const charImages = [
  [
    "/certification/s24/images/character/stage1_1.png",
    "/certification/s24/images/character/stage1_2.png",
    "/certification/s24/images/character/stage1_3.png",
    "/certification/s24/images/character/stage1_4.png",
    "/certification/s24/images/character/stage1_5.png",
  ],
  [
    "/certification/s24/images/character/stage2_1.png",
    "/certification/s24/images/character/stage2_2.png",
    "/certification/s24/images/character/stage2_3.png",
    "/certification/s24/images/character/stage2_4.png",
    "/certification/s24/images/character/stage2_5.png",
  ],
  [
    "/certification/s24/images/character/stage3_1.png",
    "/certification/s24/images/character/stage3_2.png",
    "/certification/s24/images/character/stage3_3.png",
    "/certification/s24/images/character/stage3_4.png",
    "/certification/s24/images/character/stage3_5.png",
  ],
  [
    "/certification/s24/images/character/stage4_1.png",
    "/certification/s24/images/character/stage4_2.png",
    "/certification/s24/images/character/stage4_3.png",
    "/certification/s24/images/character/stage4_4.png",
    "/certification/s24/images/character/stage4_5.png",
  ],
];

const bgImages = [
  "/certification/s24/images/background/bg_1.png",
  "/certification/s24/images/background/bg_2.png",
  "/certification/s24/images/background/bg_3.png",
  "/certification/s24/images/background/bg_4.png",
];

async function createTriggers() {
  // Trigger function for UserQuizLog -> UserQuizStatistics
  await prisma.$executeRaw`
    CREATE OR REPLACE FUNCTION sync_user_quiz_statistics()
    RETURNS TRIGGER AS $$
    BEGIN
        -- 데이터가 존재하면 업데이트
        IF EXISTS (SELECT 1 FROM "UserQuizStatistics" WHERE id = NEW.id) THEN
            UPDATE "UserQuizStatistics"
            SET 
                "userId" = COALESCE(NEW.userId, "userId"),
                "authType" = COALESCE(NEW.authType, "authType"),
                "campaignId" = COALESCE(NEW.campaignId, "campaignId"),
                "isCompleted" = COALESCE(NEW.isCompleted, "isCompleted"),
                "isBadgeAcquired" = COALESCE(NEW.isBadgeAcquired, "isBadgeAcquired"),
                "lastCompletedStage" = COALESCE(NEW.lastCompletedStage, "lastCompletedStage"),
                "elapsedSeconds" = COALESCE(NEW.elapsedSeconds, "elapsedSeconds"),
                "createdAt" = COALESCE(NEW.createdAt, "createdAt"),
                "updatedAt" = COALESCE(NEW.createdAt, "updatedAt"),
                "quizSetId" = COALESCE(NEW.quizSetId, "quizSetId"),
                "score" = COALESCE(NEW.score, "score"),
                "quizSetPath" = COALESCE(NEW.quizSetPath, "quizSetPath"),
                "domainId" = COALESCE(NEW.domainId, "domainId"),
                "languageId" = COALESCE(NEW.languageId, "languageId"),
                "jobId" = COALESCE(NEW.jobId, "jobId"),
                "regionId" = COALESCE(NEW.regionId, "regionId"),
                "subsidaryId" = COALESCE(NEW.subsidaryId, "subsidaryId"),
                "storeId" = COALESCE(NEW.storeId, "storeId"),
                "storeSegmentText" = COALESCE(NEW.storeSegmentText, "storeSegmentText"),
                "channelId" = COALESCE(NEW.channelId, "channelId"),
                "channelSegmentId" = COALESCE(NEW.channelSegmentId, "channelSegmentId"),
                "channelName" = COALESCE(NEW.channelName, "channelName")
            WHERE id = NEW.id;
        ELSE
            -- 데이터가 없으면 삽입
            INSERT INTO "UserQuizStatistics" (
                "id",
                "userId", 
                "authType", 
                "campaignId", 
                "isCompleted", 
                "isBadgeAcquired",
                "lastCompletedStage", 
                "elapsedSeconds", 
                "createdAt", 
                "updatedAt",
                "quizSetId", 
                "score", 
                "quizSetPath", 
                "domainId", 
                "languageId", 
                "jobId",
                "regionId", 
                "subsidaryId", 
                "storeId", 
                "storeSegmentText", 
                "channelId",
                "channelSegmentId", 
                "channelName"
            )
            VALUES (
                NEW.id, 
                COALESCE(NEW.userId, ''),
                COALESCE(NEW.authType, ''),
                COALESCE(NEW.campaignId, ''),
                COALESCE(NEW.isCompleted, FALSE),
                COALESCE(NEW.isBadgeAcquired, FALSE),
                COALESCE(NEW.lastCompletedStage, 0),
                COALESCE(NEW.elapsedSeconds, 0),
                COALESCE(NEW.createdAt, now()),
                COALESCE(NEW.updatedAt, now()),
                NEW.quizSetId,
                COALESCE(NEW.score, 0),
                NEW.quizSetPath,
                NEW.domainId,
                NEW.languageId,
                NEW.jobId,
                NEW.regionId,
                NEW.subsidaryId,
                NEW.storeId,
                NEW.storeSegmentText,
                NEW.channelId,
                NEW.channelSegmentId,
                NEW.channelName
            );
        END IF;

        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `;

  await prisma.$executeRaw`
    CREATE TRIGGER trigger_sync_user_quiz_statistics
    AFTER INSERT OR UPDATE ON "UserQuizLog"
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_quiz_statistics();
  `;

  // await prisma.$executeRaw`
  //   CREATE OR REPLACE FUNCTION update_user_quiz_statistics()
  //   RETURNS TRIGGER AS $$
  //   BEGIN
  //     INSERT INTO "UserQuizStatistics" (userId, campaignId, quizSetId, totalElapsedSeconds, totalScore)
  //     VALUES (NEW.userId, NEW.campaignId, NEW.quizSetId, COALESCE(NEW.elapsedSeconds, 0), COALESCE(NEW.score, 0))
  //     ON CONFLICT (userId, campaignId, quizSetId)
  //     DO UPDATE SET
  //       totalElapsedSeconds = COALESCE("UserQuizStatistics".totalElapsedSeconds, 0) + COALESCE(NEW.elapsedSeconds, 0),
  //       totalScore = COALESCE("UserQuizStatistics".totalScore, 0) + COALESCE(NEW.score, 0);

  //     RETURN NEW;
  //   END;
  //   $$ LANGUAGE plpgsql;
  // `;

  // await prisma.$executeRaw`
  //   CREATE TRIGGER after_user_quiz_log_insert
  //   AFTER INSERT OR UPDATE ON "UserQuizLog"
  //   FOR EACH ROW
  //   EXECUTE FUNCTION update_user_quiz_statistics();
  // `;

  // // Trigger function for UserQuizBadgeStageLog -> UserQuizBadgeStageStatistics
  // await prisma.$executeRaw`
  //   CREATE OR REPLACE FUNCTION update_user_quiz_badge_stage_statistics()
  //   RETURNS TRIGGER AS $$
  //   BEGIN
  //     INSERT INTO "UserQuizBadgeStageStatistics" (userId, campaignId, quizStageId, isBadgeAcquired)
  //     VALUES (NEW.userId, NEW.campaignId, NEW.quizStageId, NEW.isBadgeAcquired)
  //     ON CONFLICT (userId, campaignId, quizStageId)
  //     DO UPDATE SET
  //       isBadgeAcquired = NEW.isBadgeAcquired;

  //     RETURN NEW;
  //   END;
  //   $$ LANGUAGE plpgsql;
  // `;

  // await prisma.$executeRaw`
  //   CREATE TRIGGER after_user_quiz_badge_stage_log_insert
  //   AFTER INSERT OR UPDATE ON "UserQuizBadgeStageLog"
  //   FOR EACH ROW
  //   EXECUTE FUNCTION update_user_quiz_badge_stage_statistics();
  // `;

  // // Trigger function for UserQuizStageLog -> UserQuizStageStatistics
  // await prisma.$executeRaw`
  //   CREATE OR REPLACE FUNCTION update_user_quiz_stage_statistics()
  //   RETURNS TRIGGER AS $$
  //   BEGIN
  //     INSERT INTO "UserQuizStageStatistics" (userId, campaignId, quizStageId, elapsedSeconds, score)
  //     VALUES (NEW.userId, NEW.campaignId, NEW.quizStageId, COALESCE(NEW.elapsedSeconds, 0), COALESCE(NEW.score, 0))
  //     ON CONFLICT (userId, campaignId, quizStageId)
  //     DO UPDATE SET
  //       elapsedSeconds = COALESCE("UserQuizStageStatistics".elapsedSeconds, 0) + COALESCE(NEW.elapsedSeconds, 0),
  //       score = COALESCE("UserQuizStageStatistics".score, 0) + COALESCE(NEW.score, 0);

  //     RETURN NEW;
  //   END;
  //   $$ LANGUAGE plpgsql;
  // `;

  // await prisma.$executeRaw`
  //   CREATE TRIGGER after_user_quiz_stage_log_insert
  //   AFTER INSERT OR UPDATE ON "UserQuizStageLog"
  //   FOR EACH ROW
  //   EXECUTE FUNCTION update_user_quiz_stage_statistics();
  // `;

  // // Trigger function for UserQuizQuestionLog -> UserQuizQuestionStatistics
  // await prisma.$executeRaw`
  //   CREATE OR REPLACE FUNCTION update_user_quiz_question_statistics()
  //   RETURNS TRIGGER AS $$
  //   BEGIN
  //     INSERT INTO "UserQuizQuestionStatistics" (userId, quizSetId, questionId, isCorrect, elapsedSeconds)
  //     VALUES (NEW.userId, NEW.quizSetId, NEW.questionId, NEW.isCorrect, COALESCE(NEW.elapsedSeconds, 0))
  //     ON CONFLICT (userId, quizSetId, questionId)
  //     DO UPDATE SET
  //       isCorrect = NEW.isCorrect,
  //       elapsedSeconds = COALESCE("UserQuizQuestionStatistics".elapsedSeconds, 0) + COALESCE(NEW.elapsedSeconds, 0);

  //     RETURN NEW;
  //   END;
  //   $$ LANGUAGE plpgsql;
  // `;

  // await prisma.$executeRaw`
  //   CREATE TRIGGER after_user_quiz_question_log_insert
  //   AFTER INSERT OR UPDATE ON "UserQuizQuestionLog"
  //   FOR EACH ROW
  //   EXECUTE FUNCTION update_user_quiz_question_statistics();
  // `;
}

async function main() {
  // Create Campaign
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

    const campaign = await prisma.campaign.findFirst();
    await prisma.domainGoal.createMany({
      data: domains.map((country: any) => {
        const domainId = country.domainId.toString();
        const subsidaryId =
          subsidaries
            .find((subsidiary) => subsidiary.domainId === domainId)
            ?.domainId?.toString() ?? null;
        const regionsId =
          regions
            .find((region) => region.domainId === subsidaryId)
            ?.domainId?.toString() ?? null;
        return {
          campaignId: campaign.id,
          domainId: domainId,
          regionId: regionsId,
          subsidaryId: subsidaryId,
          userCount: 1000,
        };
      }),
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

      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const questionId = uuid.v4();

        const originalQuestionId =
          domainCode === "HQ_NAT_0001"
            ? questionId
            : hqNatQuestions.find(
                (hqQ) => hqQ.originalIndex === question.originQuestionIndex
              )?.id || null;

        const stageIndex = question.stage - 1;
        const imageIndex = i % charImages[stageIndex].length;
        let item = await prisma.question.findFirst({
          where: {
            originalQuestionId,
            languageId: language.id,
          },
        });

        if (!item) {
          item = await prisma.question.create({
            data: {
              id: questionId,
              text: question.text.toString(),
              timeLimitSeconds: parseInt(question.timeLimitSeconds),
              languageId: language.id,
              originalQuestionId,
              originalIndex: question.originQuestionIndex,
              category: question.category,
              specificFeature: question.specificFeature ?? "",
              importance: question.importance,
              enabled: question.enabled === 1 || question.enabled === "1",
              product: question.product,
              questionType: question.questionType,
              order: question.orderInStage ?? 0,
              backgroundImageUrl: bgImages[stageIndex],
              characterImageUrl: charImages[stageIndex][imageIndex],
            },
          });

          for (let j = 0; j < question.options.length; j++) {
            const option = question.options[j];
            await prisma.questionOption.findFirst({
              where: {
                questionId,
                order: j,
                languageId: language.id,
              },
            });
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

        console.log("item", item);

        createdQuestions.push(item);
        if (domainCode === "HQ_NAT_0001") {
          hqNatQuestions.push(item);
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

        console.log("questionIds", questionIds);

        const isLastStage = i === stages.length - 1;
        let isBadgeStage = false;
        let badgeActivityId: string | null = null;
        let badgeImageUrl: string | null = null;

        const stage3BadgeActivityId = "251748";
        const stage4BadgeActivityId = "251749";

        if (i === 2) {
          isBadgeStage = true;
          badgeActivityId = stage3BadgeActivityId;
          badgeImageUrl = "/certification/s24/images/badge/badge_stage3.png";
        } else if (i === 3) {
          isBadgeStage = true;
          badgeActivityId = stage4BadgeActivityId;
          badgeImageUrl = "/certification/s24/images/badge/badge_stage4.png";
        }

        await prisma.quizStage.create({
          data: {
            name: stage.toString(),
            order: stage,
            questionIds,
            lifeCount: 5,
            quizSetId: quizSet.id,
            isBadgeStage: isBadgeStage,
            badgeActivityId: badgeActivityId, // 250659, 250642, 250639, 250641
            badgeImageUrl: badgeImageUrl,
            // backgroundImageUrl: bgImages[i],
            // characterImageUrl: charImages[i],
          },
        });
      }
    }
  };

  await createCampaign();
  await createSeeds();
  await createOriginQuizSet();
  // await createTriggers();

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
