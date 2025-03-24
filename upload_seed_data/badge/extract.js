const fs = require("fs");
const xlsx = require("xlsx");

function filterUsersWithoutStatus200(inputFile, outputFile) {
  // 엑셀 파일 읽기
  const workbook = xlsx.readFile(inputFile);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // 데이터를 JSON 형식으로 변환
  const data = xlsx.utils.sheet_to_json(worksheet);

  // userId별 status 200 존재 여부 확인
  const userStatusMap = new Map();

  data.forEach((row) => {
    const userId = row.userId;
    if (!userStatusMap.has(userId)) {
      userStatusMap.set(userId, false); // 기본적으로 200 없음
    }
    if (row.status === 200) {
      userStatusMap.set(userId, true); // 200이 존재하면 true로 변경
    }
  });

  // status 200이 없는 userId만 필터링하고, certification이 s25인 항목 제거
  const filteredUsers = data.filter(
    (row) => !userStatusMap.get(row.userId) && row.certification !== "s25"
  );

  // userId 기준으로 유니크한 데이터만 남기기
  const uniqueUsers = new Map();
  filteredUsers.forEach((row) => {
    if (!uniqueUsers.has(row.userId)) {
      uniqueUsers.set(row.userId, row);
    }
  });

  const uniqueUserList = Array.from(uniqueUsers.values());

  // 새로운 엑셀 파일 생성
  const newWorksheet = xlsx.utils.json_to_sheet(uniqueUserList);
  const newWorkbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, "FilteredUsers");

  // 파일 저장
  xlsx.writeFile(newWorkbook, outputFile);
  console.log(`필터링된 데이터가 ${outputFile} 파일로 저장되었습니다.`);
}

// 실행
const inputFile = "badge_log_2025323_1827.xlsx"; // 기존 엑셀 파일
const outputFile = "filtered.xlsx"; // 저장할 새로운 엑셀 파일
filterUsersWithoutStatus200(inputFile, outputFile);
