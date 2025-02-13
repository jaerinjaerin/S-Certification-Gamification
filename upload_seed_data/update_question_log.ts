const { PrismaClient, Question } = require("@prisma/client");
const uuid = require("uuid");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  const languageCode = "en-US";
  const language = await prisma.language.findFirst({
    where: { code: languageCode },
  });

  if (!language) {
    console.error("❌ Language not found");
    return;
  }

  console.log("✅ Language ID:", language.id);

  const hqQuestions = await prisma.question.findMany({
    where: { languageId: language.id },
  });

  const questions = await prisma.question.findMany();

  console.log("✅ HQ Questions:", hqQuestions.length);
  console.log("✅ Questions:", questions.length);

  const startDate = new Date("2025-01-20");
  const endDate = new Date("2025-02-10");

  // 결과 저장할 객체
  const dailyLogs = {};

  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(currentDate);
    endOfDay.setHours(23, 59, 59, 999);

    console.log(
      `🔍 Processing date: ${startOfDay.toISOString().split("T")[0]}`
    );

    let skip = 0;
    const batchSize = 100; // 한 번에 가져올 데이터 개수

    let hasMoreData = true;

    while (hasMoreData) {
      const logs = await prisma.userQuizQuestionStatistics.findMany({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        orderBy: { createdAt: "asc" },
        skip,
        take: batchSize,
      });

      if (logs.length === 0) {
        hasMoreData = false;
        break;
      }

      for (const log of logs) {
        if (log.originalQuestionId != null) {
          const question = questions.find((q) => q.id === log.questionId);
          if (question) {
            const originQuestion = hqQuestions.find(
              (q) => q.id === question.originalQuestionId
            );

            if (originQuestion) {
              await prisma.userQuizQuestionStatistics.update({
                where: { id: log.id },
                data: {
                  originalQuestionId: originQuestion.id,
                  originalIndex: originQuestion.originalIndex,
                },
              });
            }
          }

          if (!question) {
            console.error(`❌ Question not found: ${log.originalQuestionId}`);
          }
        }
      }

      const dateKey = startOfDay.toISOString().split("T")[0];
      if (!dailyLogs[dateKey]) dailyLogs[dateKey] = [];
      dailyLogs[dateKey].push(...logs);

      console.log(`📅 ${dateKey}: Processed ${logs.length} entries`);

      skip += batchSize; // 다음 배치 처리

      // DB 부담 방지를 위해 일정 시간 대기 (500ms)
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // 다음 날짜로 이동
    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log("✅ Finished processing all dates");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
