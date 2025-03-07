const { PrismaClient, Question } = require("@prisma/client");
const uuid = require("uuid");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  const createSeeds = async () => {
    // Create Regions
    let filePath;
    let fileContent;

    // Create Languages
    filePath = path.join(process.cwd(), "data", "seeds", "languages.json");

    // JSON 파일 읽기
    fileContent = fs.readFileSync(filePath, "utf-8");
    const languages = JSON.parse(fileContent);

    for (var i = 0; i < languages.length; i++) {
      const lang = languages[i];
      const language = await prisma.language.findFirst({
        where: { code: lang.code },
      });

      if (!language) {
        await prisma.language.create({
          data: {
            code: lang.code,
            name: lang.name,
          },
        });
      } else {
        await prisma.language.update({
          where: { id: language.id },
          data: {
            code: lang.code,
            name: lang.name,
          },
        });
      }
    }
  };

  createSeeds();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
