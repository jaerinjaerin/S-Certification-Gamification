import * as XLSX from 'xlsx';

/**
 * 엑셀 데이터를 JSON으로 변환하는 함수
 * @param file 엑셀 파일 (File 객체)
 * @returns 변환된 JSON 데이터 또는 오류 메시지 포함 객체
 */
export const convertExcelToJson = async (
  file: File
): Promise<
  | { success: true; data: Record<string, string> }
  | { success: false; errorMessage: string }
> => {
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet) as Array<{
      Main: string;
      Revised: string;
    }>;

    // 데이터 누락 여부 확인
    const hasMissingValues = jsonData.some((row) => !row.Revised);
    if (hasMissingValues) {
      return {
        success: false,
        errorMessage: 'Data is Missing',
      };
    }

    // JSON 변환
    const transformedData = jsonData.reduce(
      (acc, curr) => {
        if (curr.Main && curr.Revised) {
          acc[curr.Main] = curr.Revised;
        }
        return acc;
      },
      {} as Record<string, string>
    );

    return { success: true, data: transformedData };
  } catch (error) {
    return {
      success: false,
      errorMessage:
        error instanceof Error
          ? error.message
          : '파일 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
    };
  }
};
