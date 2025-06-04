const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const xlsx = require("xlsx");

const prisma = new PrismaClient();

async function exportToExcel() {
  try {
    // ✅ 2만 건 데이터 조회
    const logs = await prisma.userQuizQuestionLog.findMany({
      take: 20000,
    });

    if (logs.length === 0) {
      console.log("데이터가 없습니다.");
      return;
    }

    // ✅ 워크북 생성 및 데이터 시트화
    const worksheet = xlsx.utils.json_to_sheet(logs);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "UserQuizLogs");

    // ✅ 파일로 저장
    const outputPath = "./user_quiz_logs.xlsx";
    xlsx.writeFile(workbook, outputPath);

    console.log(`엑셀 파일이 생성되었습니다: ${outputPath}`);
  } catch (error) {
    console.error("에러 발생:", error);
  } finally {
    await prisma.$disconnect();
  }
}

exportToExcel();
