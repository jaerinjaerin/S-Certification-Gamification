const fs = require("fs");
const xlsx = require("xlsx");

function filterUsersAllStatusNot200(inputFile, outputFile) {
  // 엑셀 파일 읽기
  const workbook = xlsx.readFile(inputFile);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // 데이터를 JSON 형식으로 변환
  const data = xlsx.utils.sheet_to_json(worksheet, { defval: "" }); // defval: ""로 빈 셀도 유지

  // 컬럼 순서 가져오기
  const originalHeaders = xlsx.utils.sheet_to_json(worksheet, {
    header: 1,
  })[0]; // 첫 번째 row (헤더)

  // userId로 그룹핑
  const groupedByUser = new Map();

  data.forEach((row) => {
    const userId = row.userId;
    if (!groupedByUser.has(userId)) {
      groupedByUser.set(userId, []);
    }
    groupedByUser.get(userId).push(row);
  });

  const result = [];

  // 각 userId 그룹별로 확인
  for (const [userId, rows] of groupedByUser.entries()) {
    const hasAll200 = rows.every((row) => row.status === 200);
    if (rows.length !== 2) {
      console.log(userId, rows.length, hasAll200);
    }
    if (!hasAll200) {
      rows.forEach((row) => {
        result.push(row);
      });
    }
  }

  // 새로운 시트 생성 - 원래 컬럼 순서 유지
  const newWorksheet = xlsx.utils.json_to_sheet(result, {
    header: originalHeaders,
    skipHeader: false,
  });

  // 워크북 저장
  const newWorkbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, "FilteredUsers");
  xlsx.writeFile(newWorkbook, outputFile);
  console.log(`필터링된 데이터가 ${outputFile} 파일로 저장되었습니다.`);
}

// 실행
const inputFile = "badge_log_2025-03-23_extract.xlsx";
const outputFile = "filtered.xlsx";
filterUsersAllStatusNot200(inputFile, outputFile);
