const { PrismaClient, Question } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("Seeding database...");

  // Helper function to load and process a single JSON file
  const loadAndInsertData = async (filePath, tableName) => {
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8")).map((item) => ({
      ...item,
      domainId: item.domainId ? String(item.domainId) : null,
      regionId: item.regionId ? String(item.regionId) : null,
      subsidiaryId: item.subsidiaryId ? String(item.subsidiaryId) : null,
      storeId: item.storeId ? String(item.storeId) : null,
      channelId: item.channelId ? String(item.channelId) : null,
      channelSegmentId: item.channelSegmentId
        ? String(item.channelSegmentId)
        : null,
    }));

    const BATCH_SIZE = 500;
    // console.log(`Inserting data into ${tableName} from ${filePath}...`);
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      await prisma[tableName].createMany({
        data: data.slice(i, i + BATCH_SIZE),
      });

      await sleep(500);
    }

    if (global.gc) {
      global.gc();
    } else {
      console.warn(
        "Garbage collection is not exposed. Start your script with `node --expose-gc`."
      );
    }
  };

  // Paths to directories containing JSON files
  const directories = [
    { path: "./results/user_quiz_logs/2025", table: "userQuizStatistics" },
    {
      path: "./results/user_quiz_stage_logs/2025",
      table: "userQuizStageStatistics",
    },
    {
      path: "./results/user_quiz_question_logs/2025",
      table: "userQuizQuestionStatistics",
    },
    {
      path: "./results/user_quiz_badge_stage_logs/2025",
      table: "userQuizBadgeStageStatistics",
    },
  ];

  for (const { path: dirPath, table } of directories) {
    const filePaths = fs.readdirSync(path.resolve(__dirname, dirPath));

    for (const file of filePaths) {
      const filePath = path.join(__dirname, dirPath, file);
      await loadAndInsertData(filePath, table);
    }

    console.log(`Data inserted into ${table} table.`);
  }

  console.log("Database seeding completed!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
