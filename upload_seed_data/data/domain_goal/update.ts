const { PrismaClient, Question } = require("@prisma/client");
const fs = require("fs");

const prisma = new PrismaClient();

// JSON 파일 경로
const jsonFilePath = "./domain_target.json";

// JSON 파일 읽기
const rawData = fs.readFileSync(jsonFilePath, "utf-8");
const jsonData = JSON.parse(rawData);

async function updateDomainGoals() {
  for (const [code, data] of Object.entries(jsonData)) {
    try {
      // 1. `Domain` 테이블에서 code를 기준으로 domainId 찾기
      const domain = await prisma.domain.findUnique({
        where: { code },
        select: { id: true },
      });

      if (!domain) {
        console.log(`⚠️ Domain not found for code: ${code}`);
        continue;
      }

      // 2. `DomainGoal` 테이블에서 domainId로 기존 데이터 찾기
      const existingDomainGoal = await prisma.domainGoal.findFirst({
        where: { domainId: domain.id },
      });

      if (existingDomainGoal) {
        // 3. 기존 데이터 업데이트
        await prisma.domainGoal.update({
          where: { id: existingDomainGoal.id },
          data: {
            ff: data.ff || 0,
            fsm: data.fsm || 0,
            ffSes: data.ffSes || 0,
            fsmSes: data.fsmSes || 0,
            updatedAt: new Date(),
          },
        });
        console.log(`✅ Updated DomainGoal for ${code}`);
      } else {
        // 4. 데이터가 없으면 새로 생성
        await prisma.domainGoal.create({
          data: {
            domainId: domain.id,
            campaignId: "default_campaign", // 적절한 campaignId 설정 필요
            ff: data.ff || 0,
            fsm: data.fsm || 0,
            ffSes: data.ffSes || 0,
            fsmSes: data.fsmSes || 0,
          },
        });
        console.log(`✅ Created new DomainGoal for ${code}`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${code}:`, error);
    }
  }
}

// 실행
updateDomainGoals()
  .then(() => {
    console.log("🚀 Update process completed");
    prisma.$disconnect();
  })
  .catch((error) => {
    console.error("❌ Unexpected error:", error);
    prisma.$disconnect();
  });
