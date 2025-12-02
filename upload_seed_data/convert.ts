import fs from "fs-extra";
import jsonfile from "jsonfile";
import path from "path";
import xlsx from "xlsx";

/**
 * 📌 Excel 파일을 JSON으로 변환하는 함수
 * @param filePath 변환할 Excel 파일의 경로
 * @param outputDir JSON 파일이 저장될 디렉토리 (선택)
 * @returns 변환된 JSON 데이터 객체 또는 저장된 파일 경로
 */
export async function convertExcelToJson(
  filePath: string,
  outputDir?: string
): Promise<any> {
  try {
    // 📌 파일 존재 여부 확인
    if (!fs.existsSync(filePath)) {
      throw new Error(`❌ 파일이 존재하지 않습니다: ${filePath}`);
    }

    console.log(`📂 파일 변환 중: ${filePath}`);

    // 📌 STEP 1: Excel 파일 로드
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // 첫 번째 시트 사용
    const sheet = workbook.Sheets[sheetName];

    // 📌 STEP 2: 데이터를 JSON으로 변환
    const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    if (jsonData.length === 0) {
      throw new Error(`⚠️ 빈 파일입니다: ${filePath}`);
    }

    // 📌 STEP 3: "No" 컬럼 찾기
    let headerRowIndex = (jsonData as any[][]).findIndex((row: any[]) =>
      row.includes("No")
    );
    if (headerRowIndex === -1) {
      throw new Error(`⚠️ "No" 컬럼이 없습니다: ${filePath}`);
    }

    // 📌 STEP 4: 헤더와 데이터 분리
    const headers: string[] = jsonData[headerRowIndex] as string[]; // 컬럼명
    const dataRows: any[][] = (jsonData as any[][]).slice(headerRowIndex + 1); // 데이터 행들

    // 📌 STEP 5: JSON 변환 (각 행을 객체로 변환)
    const jsonResult = dataRows.map((row: any[]) => {
      let obj: Record<string, any> = {};
      headers.forEach((col, i) => {
        obj[col] = row[i] || null;
      });
      return obj;
    });

    console.log("✅ JSON 변환 완료");

    // 📌 JSON을 파일로 저장하는 경우
    if (outputDir) {
      fs.ensureDirSync(outputDir); // 출력 디렉토리 생성
      const jsonFilePath = path.join(
        outputDir,
        path.basename(filePath).replace(".xlsx", ".json")
      );
      jsonfile.writeFileSync(jsonFilePath, jsonResult, { spaces: 2 });

      console.log(`✅ JSON 저장 완료: ${jsonFilePath}`);
      return jsonFilePath; // JSON 파일 경로 반환
    }

    return jsonResult; // JSON 객체 반환
  } catch (error) {
    console.error("❌ 변환 오류:", error);
    return null;
  }
}
