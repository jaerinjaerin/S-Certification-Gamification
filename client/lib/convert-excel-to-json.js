//@ts-nocheck
import fs from "fs";
import path from "path";
import XLSX from "xlsx";
import { fileURLToPath } from "url";
import { dirname } from "path";

const matchingTable = {
  Albanian: "sq",
  Arabic: "ar-AE",
  Azerbaijan: "az",
  Bengali: "bn",
  Bosnian: "bs",
  Bulgarian: "bg",
  Croatian: "hr-HR",
  Czech: "cs",
  Danish: "da",
  Estonian: "et",
  Finnish: "fi",
  "French(Canada)": "fr-CA",
  French: "fr-FR",
  Georgian: "ka",
  German: "de-DE",
  Greek: "el",
  Hebrew: "he",
  Hongkong: "zh-TW",
  Hungarian: "hu",
  Indonesian: "id",
  Italian: "it-IT",
  Japanese: "ja",
  Khmer: "km",
  Lao: "lo",
  Latvian: "lv",
  Lithuanian: "lt",
  Macedonian: "mk",
  Myanmar: "my",
  Norwegian: "nb",
  PRC: "zh-CN",
  Polish: "pl",
  "Portuguese(Brazil)": "pt-BR",
  Portuguese: "pt-PT",
  Romanian: "ro",
  Russian: "ru",
  Serbian: "sr-Cyrl",
  Slovak: "sk-SK",
  Slovenian: "sl",
  "Spanish(LTN)": "es-419",
  Spanish: "es-ES",
  Swedish: "sv",
  Taiwan: "zh-TW",
  Thai: "th",
  Turkish: "tr",
  Uzbek: "uz",
  Vietnamese: "vi",
  Ukrainian: "uk",
  "en-US": "en-US",
};

const convertLangPackXlsxToJson = (data) => {
  return data.reduce((acc, el) => {
    if (el[0] && el[2]) {
      acc[el[0]] = el[2];
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
    console.log(files.length);

    files.forEach((file) => {
      const filePath = path.join(directoryPath, file);
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        range: 2,
      });

      const matchingValue = file.split("_")[0].trim();
      const key = matchingTable[matchingValue];
      console.log(file, key, matchingValue);
      const strings = convertLangPackXlsxToJson(jsonData);

      fs.writeFileSync(
        `../messages/${key}.json`,
        JSON.stringify(strings, null, 2)
      );
    });
  } catch (error) {
    console.error("Unable to scan directory: ", error);
    throw error;
  }
};

convertLangPackFolerToJson();
