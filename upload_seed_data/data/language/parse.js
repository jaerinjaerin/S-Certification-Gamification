var fs = require("fs");
var path = require("path");
var XLSX = require("xlsx");
/**
 * Excel 파일을 파싱하여 languages 배열을 생성합니다.
 * @param excelFilePath Excel 파일의 경로
 * @returns LanguageInfo[] 배열
 */
function parseExcelToLanguages(excelFilePath) {
  // Excel 파일 읽기
  var workbook = XLSX.readFile(excelFilePath);
  var sheetName = workbook.SheetNames[0];
  var sheet = workbook.Sheets[sheetName];
  // 첫 번째 행은 헤더로 가정합니다.
  // defval: "" 옵션은 빈 셀을 빈 문자열로 처리합니다.
  var data = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
  });
  if (data.length === 0) {
    console.error("Excel 파일에 데이터가 없습니다.");
    return [];
  }
  // 헤더 행과 데이터 행 분리
  var headerRow = data[0],
    rows = data.slice(1);
  // 헤더가 예상한 순서와 맞는지 확인 (필수는 아니지만, 경고 메시지로 확인 가능)
  var expectedHeader = ["languageCode", "name", "domainCode", "domainName"];
  var normalizedHeader = headerRow.map(function (cell) {
    return cell.toString().trim();
  });
  expectedHeader.forEach(function (expected, i) {
    if (normalizedHeader[i] !== expected) {
      console.warn(
        "\uD5E4\uB354 \uC608\uC0C1\uAC12\uACFC \uB2E4\uB984: index "
          .concat(i, ' - \uC608\uC0C1 "')
          .concat(expected, '" vs \uC2E4\uC81C "')
          .concat(normalizedHeader[i], '"')
      );
    }
  });
  // languageCode를 기준으로 그룹핑
  var domainCount = 0;
  var languageMap = {};
  rows.forEach(function (row, rowIndex) {
    // 최소 4개 컬럼 이상 있는지 확인
    if (row.length < 4) return;
    var domainName = row[0].toString().trim();
    var domainCode = row[1].toString().trim();
    var name = row[2].toString().trim();
    var languageCode = row[3].toString().trim();
    if (!languageCode) {
      console.warn(
        "Row ".concat(
          rowIndex + 2,
          "\uC5D0\uC11C languageCode\uAC00 \uBE44\uC5B4\uC788\uC2B5\uB2C8\uB2E4."
        )
      );
      return;
    }
    if (!languageMap[languageCode]) {
      languageMap[languageCode] = {
        languageCode: languageCode,
        name: name,
        domains: [],
      };
    }
    languageMap[languageCode].domains.push({
      domainCode: domainCode,
      domainName: domainName,
    });
    domainCount++;
  });

  console.log("domainCount:", domainCount);
  return Object.values(languageMap);
}
// 예제 사용
var excelFilePath = path.join(__dirname, "languages.xlsx");
var languages = parseExcelToLanguages(excelFilePath);
console.log("Parsed languages:", languages);
// languages 배열을 JSON 파일로 저장
var outputPath = path.join(__dirname, "languages.json");
fs.writeFile(
  outputPath,
  JSON.stringify(languages, null, 2),
  "utf8",
  function (err) {
    if (err) {
      console.error("Error writing JSON file:", err);
    } else {
      console.log("JSON file has been saved to:", outputPath);
    }
  }
);
