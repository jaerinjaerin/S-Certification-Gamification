"use client";
import { Button } from "@/app/components/ui/button";
import Languages from "@/public/assets/seeds/languages.json";
import { cn } from "@/utils/utils";

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

export default function SitemapPage() {
  const supportedLanguagesCode = Languages.map((lang) => lang.code);
  // const HOST_URL =
  //   process.env.NODE_ENV !== "production"
  //     ? "http://localhost:3000"
  //     : process.env.AUTH_URL;
  const HOST_URL = process.env.AUTH_URL;

  return (
    <div className="min-w-[280px] max-w-screen-md w-full min-h-svh mx-auto text-base">
      <div className="mb-[50px]">
        <h1 className="text-3xl">번역리스트</h1>
      </div>
      <p className="font-light">
        Language 개수: {supportedLanguagesCode.length} / Languages.json 기준
      </p>
      <p className="font-light text-red-600 text-sm">
        (붉은배경은 번역본이 없는 국가입니다.)
      </p>
      <div className="mt-[30px] grid grid-cols-2 gap-4">
        {supportedLanguagesCode.map((code) => {
          return (
            <a
              href={`${HOST_URL}/s24/NAT_7000_${code}/login`}
              target="_blank"
              key={code}
            >
              <Button
                variant={"outline"}
                className={cn(
                  "w-full",
                  getKeyByValue(matchingTable, code) === undefined &&
                    "bg-red-600 text-white border border-accent"
                )}
              >
                {`${getKeyByValue(matchingTable, code)} 👉🏻 ${code}`}
              </Button>
            </a>
          );
        })}
      </div>
    </div>
  );
}

// http://localhost:3000/s24/NAT_7000_en-US/map

function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}
