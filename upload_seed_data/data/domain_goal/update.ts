import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

// JSON 파일 경로
const jsonFilePath = "./domain_target.json";

// JSON 파일 읽기
const rawData = fs.readFileSync(jsonFilePath, "utf-8");
const jsonData = JSON.parse(rawData);

async function updateAllDomainGoals() {
  try {
    // 1. 모든 Domain 데이터 가져오기
    const domains = await prisma.domain.findMany({
      select: { id: true, code: true },
    });

    for (const domain of domains) {
      const { id: domainId, code } = domain;

      // 2. 엑셀 데이터에서 해당 코드의 데이터 찾기
      const data = jsonData[code] || {
        ff: 0,
        fsm: 0,
        ffSes: 0,
        fsmSes: 0,
      };

      // 3. `DomainGoal` 테이블에서 domainId로 기존 데이터 찾기
      const existingDomainGoal = await prisma.domainGoal.findFirst({
        where: { domainId },
      });

      if (existingDomainGoal) {
        // 4. 기존 데이터 업데이트
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
        // 5. 데이터가 없으면 새로 생성
        await prisma.domainGoal.create({
          data: {
            domainId,
            campaignId: "default_campaign", // 적절한 campaignId 설정 필요
            ff: data.ff || 0,
            fsm: data.fsm || 0,
            ffSes: data.ffSes || 0,
            fsmSes: data.fsmSes || 0,
          },
        });
        console.log(`✅ Created new DomainGoal for ${code}`);
      }
    }
  } catch (error) {
    console.error("❌ Error updating DomainGoal:", error);
  } finally {
    await prisma.$disconnect();
    console.log("🚀 Update process completed");
  }
}

// 실행
updateAllDomainGoals();
