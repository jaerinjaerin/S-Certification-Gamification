import * as XLSX from 'xlsx';

export interface ParsedExcelData {
  domainCode: string;
  languageCode: string;
  FF_FirstActivityID: string;
  FF_SecondActivityID: string;
  FF_FirstBadgeImage: string;
  FF_SecondBadgeImage: string;
  FSM_FirstActivityID: string;
  FSM_SecondActivityID: string;
  FSM_FirstBadgeImage: string;
  FSM_SecondBadgeImage: string;
}

export interface ActivityIdProcessResult {
  success: boolean;
  data?: ParsedExcelData[];
  error?: string;
}

export const processActivityExcelBuffer = (
  fileBuffer: Buffer
): ActivityIdProcessResult => {
  try {
    // 엑셀 파일 읽기
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // 엑셀 데이터를 JSON으로 변환
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    // 필요한 필드만 추출하여 변환
    const result = jsonData
      .map((row: any) => ({
        domainCode: row['DomainCode'],
        languageCode: row['LanguageCode'],
        FF_FirstActivityID: row['FF_FirstActivityID']?.toString(),
        FF_SecondActivityID: row['FF_SecondActivityID']?.toString(),
        FF_FirstBadgeImage: row['FF_FirstBadgeImage']?.toString(),
        FF_SecondBadgeImage: row['FF_SecondBadgeImage']?.toString(),
        FSM_FirstActivityID: row['FSM_FirstActivityID']?.toString(),
        FSM_SecondActivityID: row['FSM_SecondActivityID']?.toString(),
        FSM_FirstBadgeImage: row['FSM_FirstBadgeImage']?.toString(),
        FSM_SecondBadgeImage: row['FSM_SecondBadgeImage']?.toString(),
      }))
      .filter((item) => item.domainCode && item.languageCode); // 빈 값 제거

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
