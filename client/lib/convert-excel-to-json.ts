// @ts-nocheck

const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const convertLangPackXlsxToJson = (data) => {
  return data.reduce((acc, el) => {
    if (el[0] && el[1]) {
      acc[el[0]] = el[1];
    }
    return acc;
  }, {});
};

// lang_pack 폴더 순회 -> 파일별로 JSON 변환 -> 각각의 JSON 파일로 저장
const convertLangPackFolerToJson = async () => {
  const directoryPath = path.join(__dirname, "../messages/xlsx");

  try {
    const files = await fs.promises.readdir(directoryPath);

    files.forEach((file) => {
      const filePath = path.join(directoryPath, file);
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[1];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        range: 2,
      });

      const key = file.split(".xlsx")[0].trim();
      const strings = convertLangPackXlsxToJson(jsonData);

      fs.writeFileSync(`../messages/${key}.json`, JSON.stringify(strings, null, 2));
    });
  } catch (error) {
    console.error("Unable to scan directory: ", error);
    throw error;
  }
};

convertLangPackFolerToJson();
