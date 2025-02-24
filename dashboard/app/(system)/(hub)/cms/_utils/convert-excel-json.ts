/* eslint-disable @typescript-eslint/no-unused-vars */
import * as XLSX from 'xlsx';

/**
 * 엑셀 데이터를 JSON으로 변환하는 함수
 * @param file 엑셀 파일 (File 객체)
 * @returns 변환된 JSON 데이터 또는 오류 메시지 포함 객체
 */
export const convertUi = async (
  file: File
): Promise<
  | { success: true; result: Record<string, string> }
  | { success: false; errorMessage: string }
> => {
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet) as Array<{
      ID: string;
      Translate: string;
    }>;

    // 데이터 누락 여부 확인
    const hasMissingValues = jsonData.some((row) => !row.Translate);
    if (hasMissingValues) {
      return {
        success: false,
        errorMessage: 'Data is Missing',
      };
    }

    // JSON 변환
    const transformedData = jsonData.reduce(
      (acc, curr) => {
        if (curr.ID && curr.Translate) {
          acc[curr.ID] = curr.Translate;
        }
        return acc;
      },
      {} as Record<string, string>
    );

    return { success: true, result: transformedData };
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

export const convertQuizSet = async () => {
  try {
    // const data = await file.arrayBuffer();
    // const workbook = XLSX.read(data);
    // const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    // const jsonData = XLSX.utils.sheet_to_json(worksheet);

    return { success: true, result: { 'convertQuizSet Success': 'success' } };
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

export const convertTarget = async (
  file: File
): Promise<
  | { success: true; data: TargetFromExcelProps[] }
  | { success: false; errorMessage: string }
> => {
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet) as Array<{
      ID: string;
      Total: string;
      FF: string;
      'FF(SES)': string;
      FSM: string;
      'FSM(SES)': string;
    }>;

    const transformedData = jsonData.map((row) => {
      const {
        ID,
        Total,
        FF,
        ['FF(SES)']: FF_SES,
        FSM,
        ['FSM(SES)']: FSM_SES,
      } = row;
      return {
        code: ID.replace(/[\r\n]/g, '').trim(),
        total: Total,
        ff: FF,
        ffSes: FF_SES,
        fsm: FSM,
        fsmSes: FSM_SES,
      }; // 줄바꿈 등의 기호 제거
    });

    // 데이터가 없거나 '-'일때 0으로 변환
    const normalizedData = transformedData.map((row) => {
      const updatedRow: Record<string, string | number> = {};

      Object.entries(row).forEach(([key, value]) => {
        updatedRow[key] = value === '' || value === '-' ? 0 : value;
      });

      return updatedRow;
    }) as TargetFromExcelProps[];

    // 노멀라이징 이후 숫자 데이터 누락 여부 확인
    const hasNonNumericValues = normalizedData.some((row) =>
      Object.entries(row).some(
        ([key, value]) => key !== 'code' && isNaN(Number(value))
      )
    );

    if (hasNonNumericValues) {
      return {
        success: false,
        errorMessage: 'Data is Missing',
      };
    }

    return { success: true, data: normalizedData };
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
