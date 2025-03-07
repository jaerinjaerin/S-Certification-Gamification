const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

interface Domain {
  domainCode: string;
  domainName: string;
}

interface LanguageInfo {
  languageCode: string;
  name: string;
  domains: Domain[];
}

/**
 * Excel 파일을 파싱하여 languages 배열을 생성합니다.
 * @param excelFilePath Excel 파일의 경로
 * @returns LanguageInfo[] 배열
 */
function parseExcelToLanguages(excelFilePath: string): LanguageInfo[] {
  // Excel 파일 읽기
  const workbook = XLSX.readFile(excelFilePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // 첫 번째 행은 헤더로 가정합니다.
  // defval: "" 옵션은 빈 셀을 빈 문자열로 처리합니다.
  const data: any[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
  });
  if (data.length === 0) {
    console.error("Excel 파일에 데이터가 없습니다.");
    return [];
  }

  // 헤더 행과 데이터 행 분리
  const [headerRow, ...rows] = data;

  // 헤더가 예상한 순서와 맞는지 확인 (필수는 아니지만, 경고 메시지로 확인 가능)
  const expectedHeader = ["languageCode", "name", "domainCode", "domainName"];
  const normalizedHeader = headerRow.map((cell: any) => cell.toString().trim());
  expectedHeader.forEach((expected, i) => {
    if (normalizedHeader[i] !== expected) {
      console.warn(
        `헤더 예상값과 다름: index ${i} - 예상 "${expected}" vs 실제 "${normalizedHeader[i]}"`
      );
    }
  });

  // languageCode를 기준으로 그룹핑
  const languageMap: { [key: string]: LanguageInfo } = {};

  rows.forEach((row, rowIndex) => {
    // 최소 4개 컬럼 이상 있는지 확인
    if (row.length < 4) return;

    const domainName = row[0].toString().trim();
    const domainCode = row[1].toString().trim();
    const name = row[2].toString().trim();
    const languageCode = row[3].toString().trim();

    if (!languageCode) {
      console.warn(`Row ${rowIndex + 2}에서 languageCode가 비어있습니다.`);
      return;
    }

    if (!languageMap[languageCode]) {
      languageMap[languageCode] = {
        languageCode,
        name,
        domains: [],
      };
    }
    languageMap[languageCode].domains.push({
      domainCode,
      domainName,
    });
  });

  return Object.values(languageMap);
}

// 예제 사용
const excelFilePath = path.join(__dirname, "languages.xlsx");
const languages = parseExcelToLanguages(excelFilePath);

console.log("Parsed languages:", languages);

// languages 배열을 JSON 파일로 저장
const outputPath = path.join(__dirname, "languages.json");
fs.writeFile(outputPath, JSON.stringify(languages, null, 2), "utf8", (err) => {
  if (err) {
    console.error("Error writing JSON file:", err);
  } else {
    console.log("JSON file has been saved to:", outputPath);
  }
});
