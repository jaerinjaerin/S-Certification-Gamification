import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";

const convertLangPackXlsxToJson = (data) => {
  return data.reduce((acc, el) => {
    if (el[0] && el[1]) {
      acc[el[0].trim()] = el[1];
    }
    return acc;
  }, {});
};

// lang_pack 폴더 순회 -> 파일별로 JSON 변환 -> 각각의 JSON 파일로 저장
const convertLangPackFolerToJson = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const directoryPath = path.join(__dirname, "../messages/xlsx");

  try {
    const files = await fs.promises.readdir(directoryPath);
    // console.log(files.length);

    files.forEach((file) => {
      const filePath = path.join(directoryPath, file);
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        range: 1,
      });

      const key = file.split(".")[0];
      const strings = convertLangPackXlsxToJson(jsonData);

      fs.writeFileSync(
        `../messages/json/${key}.json`,
        JSON.stringify(strings, null, 2)
      );
    });
  } catch (error) {
    console.error("Unable to scan directory: ", error);
    throw error;
  }
};

convertLangPackFolerToJson();
