import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";

const matchingTable = {
  Albanian: "sq",
  "Arabic(MENA)": "ar-AE",
  Azerbaijan: "az",
  Bengali: "bn",
  Bosnian: "bs",
  Bulgarian: "bg",
  Croatian: "hr-HR",
  Czech: "cs",
  Danish: "da",
  English: "en-US",
  Estonian: "et",
  Finnish: "fi",
  // "French(Canada)": "fr-CA",
  "French(SEF)": "fr-FR",
  Georgian: "ka",
  "German(SEAS)": "de-DE",
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
  // PRC: "zh-CN",
  Polish: "pl",
  "Portuguese(Brazil)": "pt-BR",
  Portuguese: "pt-PT",
  Romanian: "ro",
  "Russian(SECE)": "ru",
  Serbian: "sr-Cyrl",
  Slovak: "sk-SK",
  Slovenian: "sl",
  "Spanish(LTN_SECH-Chile))": "es-LTN",
  Spanish: "es-ES",
  Swedish: "sv",
  Thai: "th",
  Turkish: "tr",
  Ukrainian: "uk",
  Uzbek: "uz",
  Vietnamese: "vi",
};

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
        range: 2,
      });

      const matchingValue = file.split("_Paradigm")[0].trim();

      let key;
      if (matchingTable[matchingValue]) {
        key = matchingTable[matchingValue];
      } else {
        key = matchingTable[file.split("_")[0].trim()];
      }

      console.log(file, key, matchingValue);
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
