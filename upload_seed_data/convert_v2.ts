const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

// 입력 및 출력 디렉토리 설정
const inputDir = "data/origins/test";
const outputDir = "data/questions/test";

// 출력 디렉토리가 없으면 생성
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 병합된 셀 정보를 가져오는 함수
const getMergedCellValues = (sheet) => {
  const mergedCells = sheet["!merges"] || [];
  const mergedData = {};

  mergedCells.forEach((range) => {
    const topLeftCell = xlsx.utils.encode_cell({ r: range.s.r, c: range.s.c });
    const value = sheet[topLeftCell]?.v;
    for (let r = range.s.r; r <= range.e.r; r++) {
      for (let c = range.s.c; c <= range.e.c; c++) {
        const cellAddress = xlsx.utils.encode_cell({ r, c });
        mergedData[cellAddress] = value;
      }
    }
  });

  return mergedData;
};

// Excel 파일 처리 함수
const processExcel = (filePath, outputPath) => {
  try {
    // Excel 파일 읽기
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      console.log(`No sheet found in ${filePath}`);
      return;
    }

    // 병합된 셀 정보 가져오기
    const mergedData = getMergedCellValues(sheet);

    // 워크시트를 JSON으로 변환
    let data = xlsx.utils.sheet_to_json(sheet, { header: 1, raw: false });

    // "No" 또는 "NO"가 포함된 행을 찾고, 해당 행 이후 데이터를 사용
    let headerIndex = data.findIndex((row) => row.includes("No"));
    if (headerIndex === -1) {
      console.log(`'No' column not found in ${filePath}. Skipping.`);
      return;
    }

    let headers = data[headerIndex];
    let rows = data.slice(headerIndex + 1);

    // 데이터 매핑
    let jsonData = rows.map((row) => {
      let obj = {};
      headers.forEach((colName, index) => {
        if (colName)
          obj[colName] =
            row[index] ||
            mergedData[
              xlsx.utils.encode_cell({ r: headerIndex + 1 + index, c: index })
            ] ||
            null;
      });
      return obj;
    });

    // "No" 열을 기준으로 그룹화
    let groupedData = {};
    jsonData.forEach((row) => {
      if (!row["No"]) return;
      let no = row["No"];
      if (!groupedData[no]) {
        groupedData[no] = {
          originQuestionIndex: Number(no),
          orderInStage: row["New No"] || null,
          enabled: row["Enabled"] || null,
          stage: row["Stage"] || null,
          product: row["Product"] || null,
          category: row["Category"] || null,
          specificFeature: row["SpecificFeature"] || null,
          importance: row["Importance"] || null,
          timeLimitSeconds: row["TimeLimitSeconds"] || null,
          text: row["Question"] || null,
          questionType: row["QuestionType"] || null,
          options: [],
        };
      }

      // 옵션 추가
      if (row["Answer"]) {
        groupedData[no].options.push({
          text: row["Answer"],
          answerStatus: row["AnswerStatus"] || null,
        });
      }
    });

    // JSON 데이터 저장
    fs.writeFileSync(
      outputPath,
      JSON.stringify(Object.values(groupedData), null, 2),
      "utf-8"
    );
    console.log(
      `Processed: ${path.basename(filePath)} -> ${path.basename(outputPath)}`
    );
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
};

// 입력 디렉토리의 모든 Excel 파일 처리
fs.readdirSync(inputDir).forEach((fileName) => {
  if (fileName.endsWith(".xlsx")) {
    let sanitizedFileName = fileName.replace(/{|}/g, ""); // { } 제거
    let parts = sanitizedFileName.split(".");

    if (parts.length > 2) {
      let outputFileName = parts.slice(1).join(".").replace(".xlsx", ".json");
      let inputPath = path.join(inputDir, fileName);
      let outputPath = path.join(outputDir, outputFileName);

      processExcel(inputPath, outputPath);
    }
  }
});

console.log("모든 파일이 변환되었습니다.");
