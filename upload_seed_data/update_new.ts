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
    { domainCode: "NAT_2834", activityIds: [252727, 252729] },
  ];

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
    for (const region of hqs) {
      const existingHq = await prisma.hq.findFirst({
        where: { id: region.domainId.toString() },
      });

      if (!existingHq) {
        console.log("create region", region);
        await prisma.hq.create({
          data: {
            id: region.domainId.toString(),
            code: region.domainCode.toString(),
            name: region.domainName,
            order: hqs.indexOf(region) + 1,
          },
        });
      }
    }

    for (const region of regions) {
      const existingRegion = await prisma.region.findFirst({
        where: { id: region.domainId.toString() },
      });

      if (!existingRegion) {
        console.log("create region", region);
        await prisma.region.create({
          data: {
            id: region.domainId.toString(),
            code: region.domainCode.toString(),
            name: region.domainName,
            hqId:
              hqs
                .find((hq) => hq.domainId === region.parentDomainId)
                ?.domainId?.toString() ?? null,
            order: regions.indexOf(region) + 1,
          },
        });
      }
    }

    for (const subsidiary of subsidiaries) {
      const existingSubsidiary = await prisma.subsidiary.findFirst({
        where: { id: subsidiary.domainId.toString() },
      });

      if (!existingSubsidiary) {
        console.log("create subsidiary", subsidiary);
        await prisma.subsidiary.create({
          data: {
            id: subsidiary.domainId.toString(),
            code: subsidiary.domainCode.toString(),
            name: subsidiary.domainName,
            regionId:
              regions
                .find((region) => region.domainId === subsidiary.parentDomainId)
                ?.domainId?.toString() ?? null,
            order: subsidiaries.indexOf(subsidiary) + 1,
          },
        });
      }
    }

    for (const country of domains) {
      const existingDomain = await prisma.domain.findFirst({
        where: { id: country.domainId.toString() },
      });

      if (!existingDomain) {
        console.log("create domain", country);
        await prisma.domain.create({
          data: {
            id: country.domainId.toString(),
            code: country.domainCode.toString(),
            name: country.domainName,
            subsidiaryId:
              subsidiaries
                .find(
                  (subsidiary) => subsidiary.domainId === country.parentDomainId
                )
                ?.domainId?.toString() ?? null,
            order: domains.indexOf(country) + 1,
          },
        });
      }
    }

    // Create Languages
    filePath = path.join(process.cwd(), "data", "seeds", "languages.json");

    // JSON 파일 읽기
    fileContent = fs.readFileSync(filePath, "utf-8");
    const languages = JSON.parse(fileContent);

    languages.forEach(async (language: any) => {
      const item = await prisma.language.findFirst({
        where: {
          code: language.code,
        },
      });

      if (!item) {
        await prisma.language.create({
          data: {
            code: language.code,
            name: language.name,
          },
        });
      }
    });
  };

  const createOriginQuizSet = async () => {
    const campaign = await prisma.campaign.findFirst({
      where: {
        name: "S25",
      },
    });
    const folderPath = path.join(
      process.cwd(),
      "data",
      "questions",
      "20250131"
    );
    const files = fs.readdirSync(folderPath);

    //////////// HQ 베이스 퀴즈 셋 가져오기
    const quizSet = await prisma.quizSet.findFirst({
      where: {
        domainId: "29",
        campaignId: campaign.id,
      },
      include: {
        quizStages: {
          include: {
            badgeImage: true, // Include badgeImage relation in quizStages
          },
        },
      },
    });

    if (!quizSet) {
      throw new Error("Quiz set not found");
    }

    // 기본 언어 가져오기
    const hqLanguage = await prisma.language.findFirst({
      where: { code: "en-US" },
    });

    if (!hqLanguage) {
      throw new Error("Language not found");
    }

    let hqNatQuestions = await Promise.all(
      quizSet.quizStages.map(async (quizStage) => {
        const questions = await prisma.question.findMany({
          where: {
            originalQuestionId: { in: quizStage.questionIds },
            languageId: hqLanguage.id,
          },
          include: {
            options: true,
            backgroundImage: true,
            characterImage: true,
          },
        });

        return questions;
      })
    );

    hqNatQuestions = hqNatQuestions.flat();
    hqNatQuestions.sort((a, b) => a.originalIndex - b.originalIndex);

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

      const language = await prisma.language.findFirst({
        where: { code: languageCode },
      });

      if (!domainOrSubsidiary) {
        console.error(`Domain not found for file: ${fileName}`);
        return;
      }

      if (!language) {
        console.warn(`Language not found for file: ${fileName}`);
        continue;
      }

      // 저장된 이미지 가져오기
      const savedBadgeImages = await prisma.quizBadge.findMany({
        orderBy: {
          imagePath: "asc", // 데이터가 일정하게 섞이도록 정렬
        },
      });

      const savedCharImages = await prisma.image.findMany({
        where: {
          alt: "character",
        },
        orderBy: {
          imagePath: "asc", // 데이터가 일정하게 섞이도록 정렬
        },
      });

      const savedBgImages = await prisma.image.findMany({
        where: {
          alt: "background",
        },
        orderBy: {
          imagePath: "asc", // 데이터가 일정하게 섞이도록 정렬
        },
      });

      const charImages = charImagePaths.map((stagePaths) => {
        return stagePaths.map((imagePath) => {
          const charImage = savedCharImages.find(
            (charImage) => charImage.imagePath === imagePath
          );
          return charImage;
        });
      });

      const bgImages = bgImagePaths.map((imagePath) => {
        const bgImage = savedBgImages.find(
          (bgImage) => bgImage.imagePath === imagePath
        );
        return bgImage;
      });

      const badgeImages = badgeImagePaths.map((imagePath) => {
        const badgeImage = savedBadgeImages.find(
          (badgeImage) => badgeImage.imagePath === imagePath
        );
        return badgeImage;
      });

      console.log("charImages", charImages);
      console.log("bgImages", bgImages);
      console.log("badgeImages", badgeImages);

      // continue;

      const fileContent = fs.readFileSync(filePath, "utf-8");
      const jsonQuestions = JSON.parse(fileContent);
      const createdQuestions: any[] = [];

      //////////// 퀴즈 질문 생성 및 업데이트
      for (let i = 0; i < jsonQuestions.length; i++) {
        const jsonQuestion = jsonQuestions[i];
        const questionId = uuid.v4();

        if (jsonQuestion.text == null) {
          continue;
        }

        console.log(
          "question",
          jsonQuestion.text,
          jsonQuestion.originQuestionIndex
        );

        let originalQuestionId =
          hqNatQuestions.find(
            (hqQ) => hqQ.originalIndex === jsonQuestion.originQuestionIndex
          )?.id || null;

        // 국가별로 추가된 문제는 추가된 문제 자체가 베이스 퀴즈가 됨.
        if (originalQuestionId == null) {
          console.warn(
            `Original question not found for file: ${fileName}, ${jsonQuestion.originQuestionIndex}`
          );
          originalQuestionId = questionId;
          // return;
        }

        const stageIndex = jsonQuestion.stage - 1;
        const imageIndex = i % charImages[stageIndex].length;
        // const imageIndex = charImages[stageIndex + i];
        let item = await prisma.question.findFirst({
          where: {
            originalQuestionId,
            languageId: language.id,
          },
        });

        // 질문이 없으면 생성
        if (!item) {
          item = await prisma.question.create({
            data: {
              id: questionId,
              text: jsonQuestion.text.toString(),
              timeLimitSeconds: parseInt(jsonQuestion.timeLimitSeconds),
              languageId: language.id,
              originalQuestionId,
              originalIndex: jsonQuestion.originQuestionIndex,
              category: jsonQuestion.category,
              specificFeature: jsonQuestion.specificFeature ?? "",
              importance: jsonQuestion.importance,
              enabled:
                jsonQuestion.enabled === 1 || jsonQuestion.enabled === "1"
                  ? true
                  : false,
              product: jsonQuestion.product,
              questionType: jsonQuestion.questionType,
              order:
                jsonQuestion.orderInStage ?? jsonQuestion.originQuestionIndex,
              backgroundImageId: bgImages[stageIndex].id,
              characterImageId: charImages[stageIndex][imageIndex].id,
            },
          });

          console.log("item", item);

          jsonQuestion.options.sort((a, b) => a.order - b.order);
          for (let j = 0; j < jsonQuestion.options.length; j++) {
            const option = jsonQuestion.options[j];
            const item = await prisma.questionOption.findFirst({
              where: {
                questionId,
                order: j,
                languageId: language.id,
              },
            });
            if (!item) {
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
        } else {
          // 질문이나 답변이 변경되었는지 확인
          if (item.text !== jsonQuestion.text) {
            console.log("update question", item.text, jsonQuestion.text);
            await prisma.question.update({
              where: {
                id: item.id,
              },
              data: {
                text: jsonQuestion.text.toString(),
              },
            });
          }

          // 질문 업데이트
          const questionOptions = await prisma.questionOption.findMany({
            where: {
              questionId: item.id,
              languageId: language.id,
            },
            orderBy: {
              order: "asc",
            },
          });

          // 답변이 변경되었는지 확인 후, 업데이트
          questionOptions.forEach(async (option, index) => {
            if (option.text !== jsonQuestion.options[index].text) {
              console.log(
                "update option",
                option.text,
                jsonQuestion.options[index].text
              );
              await prisma.questionOption.update({
                where: {
                  id: option.id,
                },
                data: {
                  text: jsonQuestion.options[index].text.toString(),
                  isCorrect:
                    jsonQuestion.options[index].answerStatus === 1 ||
                    jsonQuestion.options[index].answerStatus === "1",
                },
              });
            }
          });
        }

        createdQuestions.push(item);
        if (domainCode === "OrgCode-7") {
          hqNatQuestions.push(item);
        }
      }

      //////////// 퀴즈 셋 생성 또는 업데이트
      let quizSet = await prisma.quizSet.findFirst({
        where: {
          campaignId: campaign.id,
          domainId: domainOrSubsidiary.id,
        },
      });
      if (!quizSet) {
        quizSet = await prisma.quizSet.create({
          data: {
            campaignId: campaign.id,
            domainId: domainOrSubsidiary.id,
            jobCodes: ["ff", "fsm"],
            createrId: "seed",
          },
        });
      }

      // 퀴즈 스테이지 생성 또는 업데이트
      const stageNumbers = [
        ...new Set(jsonQuestions.map((question) => question.stage)),
      ].sort();

      for (let i = 0; i < stageNumbers.length; i++) {
        const stage: any = stageNumbers[i];
        // 같은 스테이지의 질문들만 필터링
        const stageQuestions = jsonQuestions.filter(
          (question) =>
            question.stage === stage &&
            (question.enabled === 1 || question.enabled === "1")
        );

        // 엑셀에 정의된 순서대로 정렬
        stageQuestions.sort((a, b) => a.orderInStage - b.orderInStage);

        // 원본 질문 인덱스로 질문 아이디 매핑
        let questionIds = stageQuestions.map((question) => {
          if (domainCode === "OrgCode-7") {
            const q: any = hqNatQuestions.find(
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

            // 원본 질문이 없는 경우, 국가에서 새롭게 추가된 질문이 원본이 됨.
            const q: any = createdQuestions.find(
              (q: any) => q.originalIndex === question.originQuestionIndex
            );

            return q?.id;
          }
        });

        // 배지 셋팅
        let isBadgeStage = false;
        let badgeActivityId: string | null = null;
        let badgeImageId: string | null = null;

        const activityIds = activityIdData.find(
          (data) => data.domainCode === domainCode
        )?.activityIds;

        const stage3BadgeActivityId =
          activityIds != null ? activityIds![0].toString() : null;
        const stage4BadgeActivityId =
          activityIds != null ? activityIds![1].toString() : null;

        if (i === 2) {
          isBadgeStage = true;
          badgeActivityId = stage3BadgeActivityId;
          badgeImageId = badgeImages[0].id;
        } else if (i === 3) {
          isBadgeStage = true;
          badgeActivityId = stage4BadgeActivityId;
          badgeImageId = badgeImages[1].id;
        }

        const quizStage = await prisma.quizStage.findFirst({
          where: {
            quizSetId: quizSet.id,
            order: stage,
          },
        });

        // 퀴즈셋이 없으면 생성
        if (!quizStage) {
          await prisma.quizStage.create({
            data: {
              name: stage.toString(),
              order: stage,
              questionIds,
              lifeCount: 5,
              quizSetId: quizSet.id,
              isBadgeStage: isBadgeStage,
              badgeActivityId: badgeActivityId,
              badgeImageId: badgeImageId,
            },
          });
        } else {
          // 퀴즈셋이 있으면 업데이트
          if (
            quizStage.isBadgeStage !== isBadgeStage ||
            quizStage.badgeActivityId !== badgeActivityId ||
            quizStage.badgeImageId !== badgeImageId ||
            quizStage.questionIds.join(",") !== questionIds.join(",")
          ) {
            await prisma.quizStage.update({
              where: {
                id: quizStage.id,
              },
              data: {
                questionIds,
                isBadgeStage: isBadgeStage,
                badgeActivityId: badgeActivityId,
                badgeImageId: badgeImageId,
              },
            });
          }
        }
      }

      console.log("complete quizSet", quizSetCount, baseFileName);
      quizSetCount++;
    }
  };

  await createSeeds();
  await createOriginQuizSet();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
