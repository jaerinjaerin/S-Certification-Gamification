const fs = require('fs');
const xlsx = require('xlsx');

function filterUsersWithoutStatus200(inputFile, outputFile) {
  const workbook = xlsx.readFile(inputFile);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const data = xlsx.utils.sheet_to_json(worksheet);

  // message가 특정 값이면 status를 422로 수정
  data.forEach((row) => {
    if (row.message === 'OK - isRegistered: false') {
      row.status = 422;
    }
  });

  // userId별 그룹화
  const userMap = new Map();
  data.forEach((row) => {
    const userId = row.userId;
    if (!userMap.has(userId)) {
      userMap.set(userId, []);
    }
    userMap.get(userId).push(row);
  });

  // REGISTER나 PROCESS에 status 200이 없는 유저 필터링
  const failedUsers = [];
  userMap.forEach((rows, userId) => {
    const registerSuccessed = rows.some(
      (row) => row.api === 'REGISTER' && row.status === 200
    );
    const processSuccessed = rows.some(
      (row) => row.api === 'PROCESS' && row.status === 200
    );
    if (!registerSuccessed || !processSuccessed) {
      failedUsers.push(...rows);
    }
  });

  // ===== Status Summary =====
  const statusSummaryMap = new Map();
  failedUsers.forEach((row) => {
    if (row.status === 200) return; // 200 제외
    const status = row.status;
    if (!statusSummaryMap.has(status)) {
      statusSummaryMap.set(status, {
        userIds: new Set(),
        messages: new Set(),
        raws: new Set(),
      });
    }
    const summary = statusSummaryMap.get(status);
    summary.userIds.add(row.userId);
    if (row.message) summary.messages.add(row.message);
    if (row.raw) summary.raws.add(row.raw);
  });

  const summaryArray = [];
  statusSummaryMap.forEach((value, status) => {
    summaryArray.push({
      status: parseInt(status),
      uniqueUserCount: value.userIds.size,
      messages: Array.from(value.messages).join('\n'),
      raws: Array.from(value.raws).join('\n'),
    });
  });

  // ===== 한 유저당 한 줄 필터 =====
  const onePerUserMap = new Map();
  failedUsers.forEach((row) => {
    if (!onePerUserMap.has(row.userId)) {
      if (row.status !== 200) {
        const { accessToken, ...rest } = row; // accessToken 제거
        onePerUserMap.set(row.userId, rest);
      }
    }
  });
  const onePerUserList = Array.from(onePerUserMap.values());

  // ===== 엑셀 저장 =====
  const newWorkbook = xlsx.utils.book_new();

  // 1. FailedUsers 전체 시트
  const failedWorksheet = xlsx.utils.json_to_sheet(failedUsers);
  xlsx.utils.book_append_sheet(newWorkbook, failedWorksheet, 'FailedUsers');

  // 2. 요약 시트
  const summaryWorksheet = xlsx.utils.json_to_sheet(summaryArray);
  xlsx.utils.book_append_sheet(newWorkbook, summaryWorksheet, 'StatusSummary');

  // 3. userId 기준 하나만 선택된 시트
  const onePerUserWorksheet = xlsx.utils.json_to_sheet(onePerUserList);
  xlsx.utils.book_append_sheet(
    newWorkbook,
    onePerUserWorksheet,
    'FilteredOnePerUser'
  );

  xlsx.writeFile(newWorkbook, outputFile);
  console.log(`필터링 결과가 ${outputFile}에 저장되었습니다.`);
}

// 실행
const inputFile = 'input.xlsx';
const outputFile = 'filtered.xlsx';
filterUsersWithoutStatus200(inputFile, outputFile);
