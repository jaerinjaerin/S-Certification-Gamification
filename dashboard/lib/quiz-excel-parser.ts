import * as XLSX from 'xlsx';

interface QuizOption {
  text: string;
  answerStatus: boolean;
}

interface QuizData {
  originQuestionIndex: number;
  orderInStage: number;
  enabled: boolean;
  stage: number;
  product?: string | null;
  category?: string | null;
  specificFeature?: string | null;
  importance?: string | null;
  timeLimitSeconds: number;
  text: string;
  questionType?: string | null;
  backgroundImageId?: string | null;
  characterImageId?: string | null;
  options: QuizOption[];
}

export interface ProcessResult {
  success: boolean;
  data?: {
    domainCode: string | null;
    languageCode: string | null;
    jobGroup: string | null;
    questions: QuizData[];
  };
  errors?: { line: number; message: string }[];
}

// 병합된 셀 정보를 가져오는 함수
const getMergedCellValues = (sheet: XLSX.WorkSheet): Record<string, any> => {
  const mergedCells = sheet['!merges'] || [];
  const mergedData: Record<string, any> = {};

  mergedCells.forEach((range) => {
    const topLeftCell = XLSX.utils.encode_cell({ r: range.s.r, c: range.s.c });
    const value = sheet[topLeftCell]?.v;
    for (let r = range.s.r; r <= range.e.r; r++) {
      for (let c = range.s.c; c <= range.e.c; c++) {
        const cellAddress = XLSX.utils.encode_cell({ r, c });
        mergedData[cellAddress] = value;
      }
    }
  });

  return mergedData;
};

// processExcelBuffer 대신 호출(handle-quizset-file-upload.ts)
// 파일명에서 domainCode, languageCode, jobGroup 추출하는 함수
export const extractFileInfo = (fileName: string) => {
  const parts = fileName.split('.');
  console.log('parts:', parts);
  if (parts.length < 4) {
    return { domainCode: null, languageCode: null, jobGroup: null };
  }

  const jobGroup = parts[3].split('_')[0]; // 날짜 부분제거
  return {
    domainCode: parts[1],
    languageCode: parts[2],
    jobGroup: jobGroup,
  };
};

// 엑셀 데이터 처리 함수
export const processExcelBuffer = (
  fileBuffer: Buffer | ArrayBuffer,
  fileName: string
): ProcessResult => {
  try {
    // 파일명에서 도메인 코드, 언어 코드, 직업군 추출
    const { domainCode, languageCode, jobGroup } = extractFileInfo(fileName);

    // Excel 파일을 Buffer에서 읽기
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      return {
        success: false,
        errors: [{ line: 0, message: 'No sheet found in the file.' }],
      };
    }

    // 병합된 셀 정보 가져오기
    const mergedData = getMergedCellValues(sheet);

    // 워크시트를 JSON으로 변환
    let data: (string | null)[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
    });

    // "No" 열 찾기
    let headerIndex = data.findIndex((row) => row.includes('No'));
    if (headerIndex === -1) {
      return {
        success: false,
        errors: [{ line: 0, message: "'No' column not found in the file." }],
      };
    }

    let errors: { line: number; message: string }[] = [];
    let headers = data[headerIndex];
    let rows = data.slice(headerIndex + 1);

    // 데이터 매핑
    let jsonData = rows.map((row, rowIndex) => {
      let obj: any = {};
      headers.forEach((colName, colIndex) => {
        if (colName) {
          obj[colName] =
            row[colIndex] ||
            mergedData[
              XLSX.utils.encode_cell({
                r: headerIndex + 1 + rowIndex,
                c: colIndex,
              })
            ] ||
            null;
        }
      });
      return obj;
    });

    // "No" 열을 기준으로 그룹화
    let groupedData: any = {};
    jsonData.forEach((row) => {
      if (!row['No']) return;
      let no = row['No'];
      if (typeof no === 'string') {
        no = row['No'].replace(/\s+/g, '');
      }

      // JSON.stringify로 출력하면 특수문자가 escape 시퀀스로 표현됩니다.
      console.log('row:', JSON.stringify(no));

      // 각 문자의 유니코드 값을 출력하는 방법
      for (let i = 0; i < no.length; i++) {
        console.log(`Index ${i}: '${no[i]}' (Code: ${no.charCodeAt(i)})`);
      }

      // 각 질문을 고유하게 분류
      if (!groupedData[no]) {
        groupedData[no] = {
          originQuestionIndex: Number(no),
          orderInStage: row['NewOrder'] ? Number(row['NewOrder']) : 0,
          enabled: row['Enabled']
            ? Number(row['Enabled']) === 1
              ? true
              : false
            : false,
          stage: row['Stage'] ? Number(row['Stage']) : 0,
          product: row['Product'] || null,
          category: row['Category'] || null,
          specificFeature: row['SpecificFeature'] || null,
          importance: row['Importance'] || null,
          timeLimitSeconds: row['TimeLimitSeconds']
            ? Number(row['TimeLimitSeconds'])
            : null,
          text: row['Question'],
          questionType: row['QuestionType'] || null,
          backgroundImageId: row['ImageBackground'] || null,
          characterImageId: row['ImageCharactor'] || null,
          options: [], // 각 문제별로 options을 따로 저장
        };

        if (groupedData[no].enabled) {
          if (groupedData[no].text == null || groupedData[no].text === '') {
            errors.push({
              line: headerIndex + groupedData[no].originQuestionIndex,
              message: `⚠️ Warning: Question ${groupedData[no].originQuestionIndex} has no text!`,
            });
          }
          if (groupedData[no].stage == null) {
            errors.push({
              line: headerIndex + groupedData[no].originQuestionIndex,
              message: `⚠️ Warning: Question ${groupedData[no].originQuestionIndex} has no stage!`,
            });
          }
          if (groupedData[no].originQuestionIndex == null) {
            errors.push({
              line: headerIndex + groupedData[no].originQuestionIndex,
              message: `⚠️ Warning: Question ${groupedData[no].originQuestionIndex} has no order!`,
            });
          }
          if (groupedData[no].orderInStage == null) {
            errors.push({
              line: headerIndex + groupedData[no].originQuestionIndex,
              message: `⚠️ Warning: Question ${groupedData[no].originQuestionIndex} has no order in stage!`,
            });
          }
          if (
            !['SINGLE_CHOICE', 'MULTI_CHOICE', 'TRUE_FALSE'].includes(
              groupedData[no].questionType
            )
          ) {
            errors.push({
              line: headerIndex + groupedData[no].originQuestionIndex,
              message: `⚠️ Warning: Question ${groupedData[no].questionType} has invalid question type!`,
            });
          }
        }
      }

      // 옵션 데이터 올바르게 매칭
      if (row['Answer']) {
        groupedData[no].options.push({
          text: row['Answer'],
          answerStatus: row['AnswerStatus']
            ? Number(row['AnswerStatus']) === 1
              ? true
              : false
            : false,
        });
      }
    });

    // 각 질문의 옵션 중복 제거
    // 정답이 없는 문제 체크
    Object.values(groupedData).forEach((question: any) => {
      let uniqueOptions = new Map();
      question.options.forEach((opt: any) => {
        if (!uniqueOptions.has(opt.text)) {
          uniqueOptions.set(opt.text, opt);
        }
      });
      question.options = Array.from(uniqueOptions.values());

      let hasCorrectAnswer = question.options.some(
        (opt: any) => opt.answerStatus === true
      );
      if (!hasCorrectAnswer) {
        console.log('Question.options:', question.options);
        errors.push({
          line: headerIndex + question.originQuestionIndex,
          message: `⚠️ Warning: Question ${question.originQuestionIndex} ${question.text} has no correct answer!`,
        });
      }
    });

    // console.log('groupedData:', groupedData);

    return {
      success: errors.length === 0,
      data: {
        questions: Object.values(groupedData),
        domainCode,
        languageCode,
        jobGroup,
      },
      errors,
    };
  } catch (error) {
    return {
      success: false,
      errors: [{ line: 0, message: `Processing error: ${error}` }],
    };
  }
};
