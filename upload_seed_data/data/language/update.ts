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
    filePath = path.join(process.cwd(), "languages_with_domain.json");

    // JSON 파일 읽기
    fileContent = fs.readFileSync(filePath, "utf-8");
    const languages = JSON.parse(fileContent);

    const domains = await prisma.domain.findMany();

    for (var i = 0; i < languages.length; i++) {
      const lang = languages[i];
      const domainDatas = lang.domains;

      const language = await prisma.language.findFirst({
        where: { code: lang.languageCode },
      });

      for (var j = 0; j < domainDatas.length; j++) {
        const domainData = domainDatas[j];
        const domain = domains.find((d) => d.code === domainData.domainCode);

        if (domain) {
          await prisma.domainWebLanguage.create({
            data: {
              campaignId: "ac2fb618-384f-41aa-ab06-51546aeacd32", // s25 campaignId
              domainId: domain.id,
              languageId: language.id,
            },
          });
        }
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
