const { PrismaClient, Question } = require("@prisma/client");
const uuid = require("uuid");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

// 실제 url: https://quiz.samsungplus.net/s25/{domainCode}_{job}_{languageCode}
// test url: http://localhost:3000/s25/{domain_code}/{job_name}/{lagnuage_code}
// test url: http://localhost:3000/s25/ORG_502_ff_ko

const charImagePaths = [
  [
    "/certification/s25/images/character/stage1_1.png",
    "/certification/s25/images/character/stage1_2.png",
    "/certification/s25/images/character/stage1_3.png",
    "/certification/s25/images/character/stage1_4.png",
    "/certification/s25/images/character/stage1_5.png",
  ],
  [
    "/certification/s25/images/character/stage2_1.png",
    "/certification/s25/images/character/stage2_2.png",
    "/certification/s25/images/character/stage2_3.png",
    "/certification/s25/images/character/stage2_4.png",
    "/certification/s25/images/character/stage2_5.png",
  ],
  [
    "/certification/s25/images/character/stage3_1.png",
    "/certification/s25/images/character/stage3_2.png",
    "/certification/s25/images/character/stage3_3.png",
    "/certification/s25/images/character/stage3_4.png",
    "/certification/s25/images/character/stage3_5.png",
  ],
  [
    "/certification/s25/images/character/stage4_1.png",
    "/certification/s25/images/character/stage4_2.png",
    "/certification/s25/images/character/stage4_3.png",
    "/certification/s25/images/character/stage4_4.png",
    "/certification/s25/images/character/stage4_5.png",
  ],
];

const bgImagePaths = [
  "/certification/s25/images/background/bg_1.jpg",
  "/certification/s25/images/background/bg_2.jpg",
  "/certification/s25/images/background/bg_3.jpg",
  "/certification/s25/images/background/bg_4.jpg",
];

const badgeImagePaths = [
  "/certification/s25/images/badge/badge_stage3.png",
  "/certification/s25/images/badge/badge_stage4.png",
];

async function main() {
  const activityIdData = [
    { domainCode: "OrgCode-7", activityIds: [252545, 252547] },
    { domainCode: "NAT_2008", activityIds: [252609, 252611] },
    { domainCode: "NAT_2070", activityIds: [252617, 252618] },
    { domainCode: "NAT_2191", activityIds: [252619, 252623] },
    { domainCode: "NAT_2807", activityIds: [252625, 252627] },
    { domainCode: "NAT_2688", activityIds: [252633, 252636] },
    { domainCode: "NAT_2705", activityIds: [252660, 252661] },
    { domainCode: "NAT_2756", activityIds: [252552, 252554] },
    { domainCode: "NAT_2756", activityIds: [252558, 252560] },
    { domainCode: "NAT_2756", activityIds: [252566, 252567] },
    { domainCode: "NAT_2040", activityIds: [252546, 252548] },
    { domainCode: "NAT_2233", activityIds: [252689, 252690] },
    { domainCode: "NAT_2428", activityIds: [252695, 252698] },
    { domainCode: "NAT_2440", activityIds: [252699, 252700] },
    { domainCode: "NAT_2203", activityIds: [252604, 252605] },
    { domainCode: "NAT_2703", activityIds: [252606, 252608] },
    { domainCode: "NAT_2250", activityIds: [252521, 252523] },
    { domainCode: "NAT_2300", activityIds: [252516, 252525] },
    { domainCode: "NAT_19602", activityIds: [252533, 252534] },
    { domainCode: "NAT_2348", activityIds: [252686, 252688] },
    { domainCode: "NAT_2380", activityIds: [252528, 252531] },
    { domainCode: "NAT_2724", activityIds: [252532, 252535] },
    { domainCode: "NAT_2620", activityIds: [252537, 252538] },
    { domainCode: "NAT_021501", activityIds: [252563, 252564] },
    { domainCode: "NAT_021501", activityIds: [252568, 252569] },
    { domainCode: "NAT_021502", activityIds: [252622, 252624] },
    { domainCode: "NAT_021503", activityIds: [252630, 252631] },
    { domainCode: "NAT_021504", activityIds: [252637, 252647] },
    { domainCode: "NAT_021504", activityIds: [252648, 252649] },
    { domainCode: "NAT_2616", activityIds: [252542, 252544] },
    { domainCode: "NAT_2100", activityIds: [252555, 252556] },
    { domainCode: "NAT_2642", activityIds: [252602, 252603] },
    { domainCode: "NAT_2398", activityIds: [252693, 252697] },
    { domainCode: "NAT_41702", activityIds: [252704, 252705] },
    { domainCode: "NAT_76202", activityIds: [252708, 252710] },
    { domainCode: "NAT_2860", activityIds: [252682, 252684] },
    { domainCode: "NAT_2643", activityIds: [252656, 252657] },
    { domainCode: "NAT_2645", activityIds: [252676, 252677] },
    { domainCode: "NAT_2644", activityIds: [252672, 252673] },
    { domainCode: "NAT_2158", activityIds: [252766, 252767] },
    { domainCode: "NAT_2704", activityIds: [252679, 252680] },
    { domainCode: "NAT_051001", activityIds: [252683, 252687] },
    { domainCode: "NAT_2360", activityIds: [252638, 252640] },
    { domainCode: "NAT_2608", activityIds: [252738, 252739] },
    { domainCode: "NAT_2702", activityIds: [252736, 252737] },
    { domainCode: "NAT_2458", activityIds: [252670, 252671] },
    { domainCode: "NAT_2764", activityIds: [252718, 252724] },
    { domainCode: "NAT_2116", activityIds: [252653, 252654] },
    { domainCode: "NAT_2418", activityIds: [252666, 252667] },
    { domainCode: "NAT_3004", activityIds: [252644, 252650] },
    { domainCode: "NAT_2050", activityIds: [252743, 252744] },
    { domainCode: "NAT_060401", activityIds: [252514, 252519] },
    { domainCode: "NAT_2356", activityIds: [252692, 252694] },
    { domainCode: "NAT_2144", activityIds: [252745, 252746] },
    { domainCode: "NAT_2818", activityIds: [252634, 252641] },
    { domainCode: "NAT_37602", activityIds: [252675, 252681] },
    { domainCode: "NAT_2275", activityIds: [252685, 252691] },
    { domainCode: "NAT_2400", activityIds: [252607, 252610] },
    { domainCode: "NAT_2368", activityIds: [252613, 252615] },
    { domainCode: "NAT_2422", activityIds: [252620, 252626] },
    { domainCode: "NAT_2504", activityIds: [252645, 252651] },
    { domainCode: "NAT_2788", activityIds: [252664, 252668] },
    { domainCode: "NAT_2012", activityIds: [252655, 252658] },
    { domainCode: "NAT_2586", activityIds: [252714, 252715] },
    { domainCode: "NAT_2682", activityIds: [252570, 252572] },
    { domainCode: "NAT_2792", activityIds: [252575, 252578] },
    { domainCode: "NAT_2784", activityIds: [252515, 252518] },
    { domainCode: "NAT_2048", activityIds: [252526, 252529] },
    { domainCode: "NAT_2414", activityIds: [252536, 252540] },
    { domainCode: "NAT_2512", activityIds: [252543, 252549] },
    { domainCode: "NAT_2634", activityIds: [252557, 252565] },
    { domainCode: "NAT_2170", activityIds: [252748, 252750] },
    { domainCode: "NAT_2707", activityIds: [252539, 252541] },
    { domainCode: "NAT_2152", activityIds: [252559, 252562] },
    { domainCode: "NAT_2068", activityIds: [252571, 252574] },
    { domainCode: "NAT_2076", activityIds: [252701, 252703] },
    { domainCode: "NAT_2780", activityIds: [252621, 252628] },
    { domainCode: "NAT_2630", activityIds: [252612, 252614] },
    { domainCode: "NAT_2591", activityIds: [252632, 252635] },
    { domainCode: "NAT_2218", activityIds: [252639, 252642] },
    { domainCode: "NAT_2188", activityIds: [252643, 252646] },
    { domainCode: "NAT_2212", activityIds: [252652, 252662] },
    { domainCode: "NAT_2388", activityIds: [252663, 252665] },
    { domainCode: "NAT_2631", activityIds: [252669, 252674] },
    { domainCode: "NAT_2633", activityIds: [252696, 252702] },
    { domainCode: "NAT_2635", activityIds: [252706, 252707] },
    { domainCode: "NAT_2632", activityIds: [252711, 252713] },
    { domainCode: "NAT_2600", activityIds: [252720, 252730] },
    { domainCode: "NAT_2858", activityIds: [252733, 252734] },
    { domainCode: "NAT_2484", activityIds: [252527, 252530] },
    { domainCode: "NAT_2604", activityIds: [252752, 252753] },
    { domainCode: "NAT_2404", activityIds: [252725, 252726] },
    { domainCode: "NAT_2834", activityIds: [252727, 252729] },
    { domainCode: "NAT_2566", activityIds: [252709, 252712] },
    { domainCode: "NAT_2686", activityIds: [252728, 252735] },
    { domainCode: "NAT_120", activityIds: [252740, 252741] },
    { domainCode: "NAT_2288", activityIds: [252731, 252732] },
    { domainCode: "NAT_384", activityIds: [252742, 252747] },
    { domainCode: "NAT_3701", activityIds: [252716, 252717] },
    { domainCode: "NAT_2710", activityIds: [252722, 252723] },
  ];

  // Create Campaign
  const createCampaign = async () => {
    await prisma.campaign.create({
      data: {
        name: "S25",
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
    const subsidiaries = allDomains.subsidiaries;
    const domains = allDomains.domains;

    // console.log("domains", domains);

    // 데이터 삽입
    await prisma.hq.createMany({
      data: hqs.map((region: any, index: number) => ({
        id: region.domainId.toString(),
        code: region.domainCode.toString(),
        name: region.domainName,
        order: index + 1,
      })),
      // skipDuplicates: true, // 중복된 데이터를 무시
    });

    await prisma.region.createMany({
      data: regions.map((region: any, index: number) => ({
        id: region.domainId.toString(),
        code: region.domainCode.toString(),
        name: region.domainName,
        hqId:
          hqs
            .find((hq) => hq.domainId === region.parentDomainId)
            ?.domainId?.toString() ?? null,
        order: index + 1,
      })),
      // skipDuplicates: true, // 중복된 데이터를 무시
    });

    await prisma.subsidiary.createMany({
      data: subsidiaries.map((subsidiary: any, index: number) => ({
        id: subsidiary.domainId.toString(),
        code: subsidiary.domainCode.toString(),
        name: subsidiary.domainName,
        regionId:
          regions
            .find((region) => region.domainId === subsidiary.parentDomainId)
            ?.domainId?.toString() ?? null,
        order: index + 1,
      })),
      // skipDuplicates: true, // 중복된 데이터를 무시
    });

    const resultDomains = await prisma.domain.createMany({
      data: domains.map((country: any, index: number) => ({
        id: country.domainId.toString(),
        code: country.domainCode.toString(),
        name: country.domainName,
        subsidiaryId:
          subsidiaries
            .find(
              (subsidiary) => subsidiary.domainId === country.parentDomainId
            )
            ?.domainId?.toString() ?? null,
        order: index + 1,
      })),
      // skipDuplicates: true, // 중복된 데이터를 무시
    });

    // console.log("resultDomains", resultDomains);

    const campaign = await prisma.campaign.findFirst();
    await prisma.domainGoal.createMany({
      data: domains.map((country: any) => {
        const domainId = country.domainId.toString();
        const subsidiaryId =
          subsidiaries
            .find((subsidiary) => subsidiary.domainId === domainId)
            ?.domainId?.toString() ?? null;
        const regionsId =
          regions
            .find((region) => region.domainId === subsidiaryId)
            ?.domainId?.toString() ?? null;
        return {
          campaignId: campaign.id,
          domainId: domainId,
          regionId: regionsId,
          subsidiaryId: subsidiaryId,
          ff: 1000,
          fsm: 1000,
          ffSes: 1000,
          fsmSes: 1000,
        };
      }),
      // skipDuplicates: true, // 중복된 데이터를 무시
    });

    // console.log("resultDomains", resultDomains);

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
    const charImages = await Promise.all(
      charImagePaths.map(async (stagePaths) => {
        return Promise.all(
          stagePaths.map(async (imagePath) => {
            return prisma.image.create({
              data: {
                imagePath: imagePath,
                caption: "character",
                format: "png",
                alt: "character",
              },
            });
          })
        );
      })
    );

    const bgImages = await Promise.all(
      bgImagePaths.map(async (imagePath: string) => {
        return prisma.image.create({
          data: {
            imagePath: imagePath,
            caption: "background",
            format: "jpg",
            alt: "background",
          },
        });
      })
    );

    // console.log("charImages", charImages);
    // console.log("bgImages", bgImages);

    const badgeImages = await Promise.all(
      badgeImagePaths.map(async (imagePath: string) => {
        return prisma.quizBadge.create({
          data: {
            imagePath: imagePath,
            name: "badge",
          },
        });
      })
    );

    // console.log("badgeImages", badgeImages);

    const campaign = await prisma.campaign.findFirst();
    const folderPath = path.join(process.cwd(), "data", "questions", "s25");
    const files = fs.readdirSync(folderPath);

    // console.log("files", files);

    // 먼저 OrgCode-7 도메인 데이터를 처리
    const hqNatQuestions: any[] = [];
    let quizSetCount = 0;
    for (const fileName of files.sort((a, b) =>
      a.includes("OrgCode-7") ? -1 : 1
    )) {
      const filePath = path.join(folderPath, fileName);
      // const domainCode = fileName.split("|")[0];
      // const languageCode = fileName.split("|")[1].split(".")[0];
      // 확장자 제거
      const baseFileName = path.basename(fileName, path.extname(fileName));
      console.log("start quizSet", baseFileName);
      // 파일명 구조 파싱
      const [domainCode, languageCode] = baseFileName.split(".");

      const domainOrSubsidiary = await prisma.domain.findFirst({
        where: { code: domainCode },
      });
      // domainCode === "OrgCode-7"
      //   ? await prisma.subsidiary.findFirst({
      //       where: { code: domainCode },
      //     })
      //   : await prisma.domain.findFirst({
      //       where: { code: domainCode },
      //     });

      let language = await prisma.language.findFirst({
        where: { code: languageCode },
      });

      // if (!language)  {
      //   language = await prisma.language.findFirst({
      //     where: { code: "en-US" },
      //   });
      // }

      if (!domainOrSubsidiary) {
        console.error(`Domain not found for file: ${fileName}`);
        return;
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

        if (question.text == null) {
          continue;
        }

        let originalQuestionId =
          domainCode === "OrgCode-7"
            ? questionId
            : hqNatQuestions.find(
                (hqQ) => hqQ.originalIndex === question.originQuestionIndex
              )?.id || null;

        // console.log(
        //   "originalQuestionId",
        //   question.originQuestionIndexi,
        //   originalQuestionId
        // );

        // 국가별로 추가된 문제는 추가된 문제 자체가 베이스 퀴즈가 됨.
        if (originalQuestionId == null) {
          console.warn(
            `Original question not found for file: ${fileName}, ${question.originQuestionIndexi}`
          );
          originalQuestionId = questionId;
        }

        const stageIndex = question.stage - 1;
        const imageIndex = i % charImages[stageIndex].length;
        // const imageIndex = charImages[stageIndex + i];
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
              enabled:
                question.enabled === 1 || question.enabled === "1"
                  ? true
                  : false,
              product: question.product,
              questionType: question.questionType,
              order: question.orderInStage ?? question.originQuestionIndex,
              backgroundImageId: bgImages[stageIndex].id,
              characterImageId: charImages[stageIndex][imageIndex].id,
              // backgroundImageUrl: bgImages[stageIndex],
              // characterImageUrl: charImages[stageIndex][imageIndex],
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

        // console.log("item", item);

        createdQuestions.push(item);
        if (domainCode === "OrgCode-7") {
          hqNatQuestions.push(item);
        }
      }
      const savedQuizSet = await prisma.quizSet.findFirst({
        where: {
          campaignId: campaign.id,
          domainId: domainOrSubsidiary.id,
        },
      });
      if (savedQuizSet) {
        continue;
      }

      const quizSet = await prisma.quizSet.create({
        data: {
          campaignId: campaign.id,
          domainId: domainOrSubsidiary.id,
          // domainId: domainCode === "OrgCode-7" ? null : domainOrSubsidiary.id,
          // subsidiaryId:
          //   domainCode === "OrgCode-7" ? domainOrSubsidiary.id : null,
          jobCodes: ["ff", "fsm"],
          createrId: "seed",
        },
      });

      // console.log("quizSet", quizSet);

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

        let questionIds = stageQuestions.map((question) => {
          if (domainCode === "OrgCode-7") {
            const q: any = createdQuestions.find(
              (q: any) => q.originalIndex === question.originQuestionIndex
            );
            return q?.id;
          } else {
            const hqQuestion: any = hqNatQuestions.find(
              (hqQ: any) => hqQ.originalIndex === question.originQuestionIndex
            );

            if (hqQuestion) {
              return hqQuestion.id;
            }

            const q: any = createdQuestions.find(
              (q: any) => q.originalIndex === question.originQuestionIndex
            );

            return q?.id;
          }
        });

        // questionIds = questionIds.filter((id) => id !== undefined);
        if (domainCode === "OrgCode-7") {
          console.log("questionIds", domainCode, stage, questionIds);
        }

        // const isLastStage = i === stages.length - 1;
        let isBadgeStage = false;
        let badgeActivityId: string | null = null;
        // let badgeImageUrl: string | null = null;
        let badgeImageId: string | null = null;

        const activityIds = activityIdData.find(
          (data) => data.domainCode === domainCode
        )?.activityIds;

        const stage3BadgeActivityId = activityIds
          ? activityIds[0].toString()
          : "251745"; //"251745";
        const stage4BadgeActivityId = activityIds
          ? activityIds[1].toString()
          : "251747"; //"251747";

        if (i === 2) {
          isBadgeStage = true;
          badgeActivityId = stage3BadgeActivityId;
          badgeImageId = badgeImages[0].id;
          // badgeImageUrl = "/certification/s25/images/badge/badge_stage3.png";
        } else if (i === 3) {
          isBadgeStage = true;
          badgeActivityId = stage4BadgeActivityId;
          badgeImageId = badgeImages[1].id;
          // badgeImageUrl = "/certification/s25/images/badge/badge_stage4.png";
        }

        // console.log("activityId", domainCode, activityIds);

        await prisma.quizStage.create({
          data: {
            name: stage.toString(),
            order: stage,
            questionIds,
            lifeCount: 5,
            quizSetId: quizSet.id,
            isBadgeStage: isBadgeStage,
            badgeActivityId: badgeActivityId, // 250659, 250642, 250639, 250641
            // badgeImageUrl: badgeImageUrl,
            badgeImageId: badgeImageId,
            // backgroundImageUrl: bgImages[i],
            // characterImageUrl: charImages[i],
          },
        });
      }

      console.log("complete quizSet", quizSetCount, baseFileName);
      quizSetCount++;
    }
  };

  await createCampaign();
  await createSeeds();
  await createOriginQuizSet();
  // await createTriggers();

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
