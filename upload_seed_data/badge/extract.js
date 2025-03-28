const fs = require("fs");
const xlsx = require("xlsx");

function setColumnWidths(worksheet, data) {
  const headers = Object.keys(data[0] || {});
  worksheet["!cols"] = headers.map((key) => {
    if (["message", "userId", "accountId"].includes(key)) return { wch: 30 };
    if (key === "raw") return { wch: 100 };
    if (key === "createdAt") return { wch: 30 };
    return { wch: 10 };
  });
}

function filterUsersWithoutStatus200(inputFile, outputFile) {
  const workbook = xlsx.readFile(inputFile);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const data = xlsx.utils.sheet_to_json(worksheet);

  // message가 특정 값이면 status를 422로 수정
  data.forEach((row) => {
    if (row.message === "OK - isRegistered: false") {
      row.status = 422;
    }
  });

  // userId별 그룹화
  const userMap = new Map();
  data.forEach((row) => {
    const userId = String(row.userId);
    if (!userMap.has(userId)) {
      userMap.set(userId, []);
    }
    userMap.get(userId).push(row);
  });

  // REGISTER 또는 PROCESS에 status 200이 없는 유저만 추출
  const failedUsers = [];
  userMap.forEach((rows, userId) => {
    const registerSuccessed = rows.some(
      (row) => row.api === "REGISTER" && row.status === 200
    );
    const processSuccessed = rows.some(
      (row) => row.api === "PROCESS" && row.status === 200
    );
    if (!registerSuccessed || !processSuccessed) {
      failedUsers.push(...rows);
    }
  });

  // ===== BadgeSummary: 유저당 1개 + 필요한 필드만 + No 번호 =====
  const badgeSummaryMap = new Map();
  failedUsers.forEach((row) => {
    const userId = String(row.userId);
    if (!badgeSummaryMap.has(userId) && row.status !== 200) {
      badgeSummaryMap.set(userId, row);
    }
  });

  const badgeSummaryList = Array.from(badgeSummaryMap.values()).map(
    (row, idx) => ({
      No: idx + 1,
      certification: row.certification || "",
      domain: row.domain || "",
      eId: row.eId || "",
      activityId: row.activityId || "",
      createdAt: row.createdAt || "",
    })
  );

  // ===== Status Summary =====
  const statusSummaryMap = new Map();
  const failedUserGroups = new Map();

  failedUsers.forEach((row) => {
    const userId = String(row.userId);
    if (!failedUserGroups.has(userId)) {
      failedUserGroups.set(userId, []);
    }
    failedUserGroups.get(userId).push(row);
  });

  failedUserGroups.forEach((rows, userId) => {
    const seenStatuses = new Set();

    rows.forEach((row) => {
      if (row.status === 200) return;
      const status = row.status;

      if (!statusSummaryMap.has(status)) {
        statusSummaryMap.set(status, {
          userIds: new Set(),
          messages: new Set(),
          raws: new Set(),
        });
      }

      const summary = statusSummaryMap.get(status);

      if (!seenStatuses.has(status)) {
        summary.userIds.add(userId);
        seenStatuses.add(status);
      }

      if (row.message) summary.messages.add(row.message);
      if (row.raw) summary.raws.add(row.raw);
    });
  });

  const summaryArray = [];
  statusSummaryMap.forEach((value, status) => {
    summaryArray.push({
      status: parseInt(status),
      uniqueUserCount: value.userIds.size,
      messages: Array.from(value.messages).join("\n"),
      raws: Array.from(value.raws).join("\n"),
    });
  });

  // ===== 한 유저당 하나 필터링 (accessToken 제거) =====
  const onePerUserMap = new Map();
  failedUsers.forEach((row) => {
    const userId = String(row.userId);
    if (!onePerUserMap.has(userId) && row.status !== 200) {
      const { accessToken, ...rest } = row;
      onePerUserMap.set(userId, rest);
    }
  });
  const onePerUserList = Array.from(onePerUserMap.values());

  // ===== 엑셀 저장 =====
  const newWorkbook = xlsx.utils.book_new();

  // 1. BadgeSummary
  const badgeWorksheet = xlsx.utils.json_to_sheet(badgeSummaryList);
  xlsx.utils.book_append_sheet(newWorkbook, badgeWorksheet, "BadgeSummary");

  // 2. FailedUsers (전체 로그)
  const failedWorksheet = xlsx.utils.json_to_sheet(failedUsers);
  setColumnWidths(failedWorksheet, failedUsers);
  xlsx.utils.book_append_sheet(newWorkbook, failedWorksheet, "FailedUsers");

  // 3. FilteredOnePerUser (에러 요약)
  const onePerUserWorksheet = xlsx.utils.json_to_sheet(onePerUserList);
  setColumnWidths(onePerUserWorksheet, onePerUserList);
  xlsx.utils.book_append_sheet(
    newWorkbook,
    onePerUserWorksheet,
    "FilteredOnePerUser"
  );

  // 4. Status Summary
  const summaryWorksheet = xlsx.utils.json_to_sheet(summaryArray);
  xlsx.utils.book_append_sheet(newWorkbook, summaryWorksheet, "StatusSummary");

  // 저장
  xlsx.writeFile(newWorkbook, outputFile);
  console.log(`필터링 결과가 ${outputFile}에 저장되었습니다.`);
}

// 실행
const inputFile = "input.xlsx";
const outputFile = "filtered.xlsx";
filterUsersWithoutStatus200(inputFile, outputFile);
