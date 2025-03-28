import * as xlsx from 'xlsx';

interface RawRow {
  userId?: string | number;
  accountId?: string;
  certification?: string;
  domain?: string;
  eId?: string;
  activityId?: string;
  createdAt?: string;
  api?: string;
  message?: string;
  raw?: string;
  status?: number;
  accessToken?: string;
  [key: string]: any; // 그 외 필드들 허용
}

interface BadgeSummaryRow {
  No: number;
  certification: string;
  domain: string;
  eId: string;
  activityId: string;
  createdAt: string;
}

interface BadgeSummaryRow {
  No: number;
  certification: string;
  domain: string;
  eId: string;
  activityId: string;
  createdAt: string;
}

interface DateSummaryRow {
  date: string;
  userCount: number;
  messages: string;
  raws: string;
}

function setColumnWidths(worksheet: xlsx.WorkSheet, data: any[]): void {
  const headers = Object.keys(data[0] || {});
  worksheet['!cols'] = headers.map((key) => {
    if (['message', 'messages', 'userId', 'accountId'].includes(key))
      return { wch: 30 };
    if (['raw', 'raws'].includes(key)) return { wch: 100 };
    if (
      ['createdAt', 'certification', 'domain', 'eId', 'activityId'].includes(
        key
      )
    )
      return { wch: 30 };
    if (['No', 'status', 'uniqueUserCount'].includes(key)) return { wch: 10 };
    return { wch: 10 };
  });
}

function truncateForSummary(text: string, maxLength: number = 200): string {
  return text.length > maxLength ? text.slice(0, maxLength - 3) + '...' : text;
}

function toKSTDateString(utcString: string): string {
  const utcDate = new Date(utcString);
  const kst = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000); // UTC + 9시간

  // YYYY-MM-DD HH:mm:ss 포맷
  const yyyy = kst.getFullYear();
  const mm = String(kst.getMonth() + 1).padStart(2, '0');
  const dd = String(kst.getDate()).padStart(2, '0');
  const hh = String(kst.getHours()).padStart(2, '0');
  const min = String(kst.getMinutes()).padStart(2, '0');
  const sec = String(kst.getSeconds()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${sec}`;
}

export async function filterUsersWithoutStatus200(blob: Blob): Promise<Blob> {
  const buffer = await blob.arrayBuffer();
  const workbook = xlsx.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data: RawRow[] = xlsx.utils.sheet_to_json(worksheet);

  // 1. 상태 코드 보정
  data.forEach((row) => {
    if (row.message === 'OK - isRegistered: false') {
      row.status = 422;
    }
  });

  // 2. userId별로 그룹화
  const userMap = new Map<string, RawRow[]>();
  data.forEach((row) => {
    if (row.userId == null || row.userId === '') return;
    const userId = String(row.userId);
    if (!userMap.has(userId)) {
      userMap.set(userId, []);
    }
    userMap.get(userId)!.push(row);
  });

  // 3. REGISTER 또는 PROCESS에서 status === 200이 없는 유저만 추출
  const failedUsers: RawRow[] = [];
  userMap.forEach((rows) => {
    const registerSuccessed = rows.some(
      (row) => row.api === 'REGISTER' && row.status === 200
    );
    const progresSuccessed = rows.some(
      (row) => row.api === 'PROGRESS' && row.status === 200
    );
    if (!registerSuccessed || !progresSuccessed) {
      failedUsers.push(...rows);
    }
  });

  // 4. BadgeSummary
  const badgeSummaryMap = new Map<string, RawRow>();
  failedUsers.forEach((row) => {
    const userId = String(row.userId);
    if (!badgeSummaryMap.has(userId) && row.status !== 200) {
      badgeSummaryMap.set(userId, row);
    }
  });

  const badgeSummaryList: BadgeSummaryRow[] = Array.from(
    badgeSummaryMap.values()
  ).map((row, idx) => ({
    No: idx + 1,
    certification: row.certification || '',
    domain: row.domain || '',
    eId: row.eId || '',
    activityId: row.activityId || '',
    createdAt: toKSTDateString(row.createdAt!),
  }));

  // 5. 날짜별 요약 (DateSummary)
  const dateSummaryMap = new Map<
    string,
    {
      userIds: Set<string>;
      messages: Set<string>;
      raws: Set<string>;
    }
  >();

  failedUsers.forEach((row) => {
    if (!row.createdAt) return;
    const date = row.createdAt.split('T')[0]; // YYYY-MM-DD
    const userId = String(row.userId);
    if (!dateSummaryMap.has(date)) {
      dateSummaryMap.set(date, {
        userIds: new Set(),
        messages: new Set(),
        raws: new Set(),
      });
    }
    const summary = dateSummaryMap.get(date)!;
    summary.userIds.add(userId);
    if (row.message) summary.messages.add(row.message);
    if (row.raw) summary.raws.add(row.raw);
  });

  const dateSummaryArray: DateSummaryRow[] = Array.from(
    dateSummaryMap.entries()
  ).map(([date, value]) => ({
    date,
    userCount: value.userIds.size,
    messages: truncateForSummary(Array.from(value.messages).join('\n')),
    raws: truncateForSummary(Array.from(value.raws).join('\n')),
  }));

  // 6. FilteredOnePerUser
  const onePerUserMap = new Map<string, RawRow>();
  failedUsers.forEach((row) => {
    const userId = String(row.userId);
    if (!onePerUserMap.has(userId) && row.status !== 200) {
      const { accessToken, ...rest } = row;
      onePerUserMap.set(userId, rest);
    }
  });
  const onePerUserList = Array.from(onePerUserMap.values());

  // 7. 엑셀 시트 구성
  const newWorkbook = xlsx.utils.book_new();

  const badgeSheet = xlsx.utils.json_to_sheet(badgeSummaryList);
  setColumnWidths(badgeSheet, badgeSummaryList);
  xlsx.utils.book_append_sheet(newWorkbook, badgeSheet, 'BadgeSummary');

  const failedSheet = xlsx.utils.json_to_sheet(failedUsers);
  setColumnWidths(failedSheet, failedUsers);
  xlsx.utils.book_append_sheet(newWorkbook, failedSheet, 'FailedUsers');

  const onePerUserSheet = xlsx.utils.json_to_sheet(onePerUserList);
  setColumnWidths(onePerUserSheet, onePerUserList);
  xlsx.utils.book_append_sheet(
    newWorkbook,
    onePerUserSheet,
    'FilteredOnePerUser'
  );

  const dateSummarySheet = xlsx.utils.json_to_sheet(dateSummaryArray);
  setColumnWidths(dateSummarySheet, dateSummaryArray);
  xlsx.utils.book_append_sheet(newWorkbook, dateSummarySheet, '날짜별 요약');

  // 8. Blob으로 변환해서 반환
  const wbout = xlsx.write(newWorkbook, { type: 'array', bookType: 'xlsx' });
  return new Blob([wbout], { type: 'application/octet-stream' });
}
