"use client";

import { Button } from "@/components/ui/button";

import { cn } from "@/utils/utils";
import { defaultLanguages } from "@/core/config/default";

const domainUrlMapping = [
  {
    domain: "KOREA",
    url: "https://quiz.samsungplus.net/s25/OrgCode-7_en-US",
    langCode: "en-US",
  },
  {
    domain: "Canada",
    url: "https://quiz.samsungplus.net/s25/NAT_7000_fr-CA",
    langCode: "fr-CA",
  },
  {
    domain: "Canada",
    url: "https://quiz.samsungplus.net/s25/NAT_7000_en-US",
    langCode: "en-US",
  },
  {
    domain: "Albania",
    url: "https://quiz.samsungplus.net/s25/NAT_2008_sq",
    langCode: "sq",
  },
  {
    domain: "BosniaandHerzegovina",
    url: "https://quiz.samsungplus.net/s25/NAT_2070_bs",
    langCode: "bs",
  },
  {
    domain: "Croatia",
    url: "https://quiz.samsungplus.net/s25/NAT_2191_hr-HR",
    langCode: "hr-HR",
  },
  {
    domain: "Macedonia(FYROM)",
    url: "https://quiz.samsungplus.net/s25/NAT_2807_mk",
    langCode: "mk",
  },
  {
    domain: "Serbia",
    url: "https://quiz.samsungplus.net/s25/NAT_2688_sr-Cyrl",
    langCode: "sr-Cyrl",
  },
  {
    domain: "Slovenia",
    url: "https://quiz.samsungplus.net/s25/NAT_2705_sl",
    langCode: "sl",
  },
  {
    domain: "Switzerland",
    url: "https://quiz.samsungplus.net/s25/NAT_2756_de-DE",
    langCode: "de-DE",
  },
  {
    domain: "Switzerland",
    url: "https://quiz.samsungplus.net/s25/NAT_2756_fr-FR",
    langCode: "fr-FR",
  },
  {
    domain: "Switzerland",
    url: "https://quiz.samsungplus.net/s25/NAT_2756_it-IT",
    langCode: "it-IT",
  },
  {
    domain: "Switzerland",
    url: "https://quiz.samsungplus.net/s25/NAT_2756_en-US",
    langCode: "en-US",
  },
  {
    domain: "Austria",
    url: "https://quiz.samsungplus.net/s25/NAT_2040_de-DE",
    langCode: "de-DE",
  },
  {
    domain: "Estonia",
    url: "https://quiz.samsungplus.net/s25/NAT_2233_et",
    langCode: "et",
  },
  {
    domain: "Latvia",
    url: "https://quiz.samsungplus.net/s25/NAT_2428_lv",
    langCode: "lv",
  },
  {
    domain: "Lithuania",
    url: "https://quiz.samsungplus.net/s25/NAT_2440_lt",
    langCode: "lt",
  },
  {
    domain: "CzechRepublic",
    url: "https://quiz.samsungplus.net/s25/NAT_2203_cs",
    langCode: "cs",
  },
  {
    domain: "Slovakia",
    url: "https://quiz.samsungplus.net/s25/NAT_2703_sk-SK",
    langCode: "sk-SK",
  },
  {
    domain: "France",
    url: "https://quiz.samsungplus.net/s25/NAT_2250_fr-FR",
    langCode: "fr-FR",
  },
  {
    domain: "Greece",
    url: "https://quiz.samsungplus.net/s25/NAT_2300_el",
    langCode: "el",
  },
  {
    domain: "Cyprus",
    url: "https://quiz.samsungplus.net/s25/NAT_19602_el",
    langCode: "el",
  },
  {
    domain: "Hungary",
    url: "https://quiz.samsungplus.net/s25/NAT_2348_hu",
    langCode: "hu",
  },
  {
    domain: "Italy",
    url: "https://quiz.samsungplus.net/s25/NAT_2380_it-IT",
    langCode: "it-IT",
  },
  {
    domain: "Spain",
    url: "https://quiz.samsungplus.net/s25/NAT_2724_es-ES",
    langCode: "es-ES",
  },
  {
    domain: "Portugal",
    url: "https://quiz.samsungplus.net/s25/NAT_2620_pt-PT",
    langCode: "pt-PT",
  },
  {
    domain: "Sweden",
    url: "https://quiz.samsungplus.net/s25/NAT_021501_sv",
    langCode: "sv",
  },
  {
    domain: "Sweden",
    url: "https://quiz.samsungplus.net/s25/NAT_021501_en-US",
    langCode: "en-US",
  },
  {
    domain: "Finland",
    url: "https://quiz.samsungplus.net/s25/NAT_021502_fi",
    langCode: "fi",
  },
  {
    domain: "Norway",
    url: "https://quiz.samsungplus.net/s25/NAT_021503_nb",
    langCode: "nb",
  },
  {
    domain: "Denmark",
    url: "https://quiz.samsungplus.net/s25/NAT_021504_da",
    langCode: "da",
  },
  {
    domain: "Denmark",
    url: "https://quiz.samsungplus.net/s25/NAT_021504_en-US",
    langCode: "en-US",
  },
  {
    domain: "Poland",
    url: "https://quiz.samsungplus.net/s25/NAT_2616_pl",
    langCode: "pl",
  },
  {
    domain: "Bulgaria",
    url: "https://quiz.samsungplus.net/s25/NAT_2100_bg",
    langCode: "bg",
  },
  {
    domain: "Romania",
    url: "https://quiz.samsungplus.net/s25/NAT_2642_ro",
    langCode: "ro",
  },
  {
    domain: "Kazakhstan",
    url: "https://quiz.samsungplus.net/s25/NAT_2398_ru",
    langCode: "ru",
  },
  {
    domain: "Kyrgyzstan",
    url: "https://quiz.samsungplus.net/s25/NAT_41702_ru",
    langCode: "ru",
  },
  {
    domain: "Tajikistan",
    url: "https://quiz.samsungplus.net/s25/NAT_76202_ru",
    langCode: "ru",
  },
  {
    domain: "Uzbekistan",
    url: "https://quiz.samsungplus.net/s25/NAT_2860_uz",
    langCode: "uz",
  },
  {
    domain: "Russia",
    url: "https://quiz.samsungplus.net/s25/NAT_2643_ru",
    langCode: "ru",
  },
  {
    domain: "Azerbaijan",
    url: "https://quiz.samsungplus.net/s25/NAT_2645_az",
    langCode: "az",
  },
  {
    domain: "Georgia",
    url: "https://quiz.samsungplus.net/s25/NAT_2644_ka",
    langCode: "ka",
  },
  {
    domain: "China",
    url: "https://quiz.samsungplus.net/s25/NAT_2156_zh-CN",
    langCode: "zh-CN",
  },
  {
    domain: "Hongkong",
    url: "https://quiz.samsungplus.net/s25/NAT_2344_zh-TW",
    langCode: "zh-TW",
  },
  {
    domain: "Taiwan",
    url: "https://quiz.samsungplus.net/s25/NAT_2158_zh-TW",
    langCode: "zh-TW",
  },
  {
    domain: "Vietnam",
    url: "https://quiz.samsungplus.net/s25/NAT_2704_vi",
    langCode: "vi",
  },
  {
    domain: "Australia",
    url: "https://quiz.samsungplus.net/s25/NAT_051001_en-US",
    langCode: "en-US",
  },
  {
    domain: "Indonesia",
    url: "https://quiz.samsungplus.net/s25/NAT_2360_id",
    langCode: "id",
  },
  {
    domain: "NewZealand",
    url: "https://quiz.samsungplus.net/s25/NAT_2554_en-US",
    langCode: "en-US",
  },
  {
    domain: "Philippines",
    url: "https://quiz.samsungplus.net/s25/NAT_2608_en-US",
    langCode: "en-US",
  },
  {
    domain: "Singapore",
    url: "https://quiz.samsungplus.net/s25/NAT_2702_en-US",
    langCode: "en-US",
  },
  {
    domain: "Malaysia",
    url: "https://quiz.samsungplus.net/s25/NAT_2458_en-US",
    langCode: "en-US",
  },
  {
    domain: "Thailand",
    url: "https://quiz.samsungplus.net/s25/NAT_2764_th",
    langCode: "th",
  },
  {
    domain: "Cambodia",
    url: "https://quiz.samsungplus.net/s25/NAT_2116_km",
    langCode: "km",
  },
  {
    domain: "Laos",
    url: "https://quiz.samsungplus.net/s25/NAT_2418_lo",
    langCode: "lo",
  },
  {
    domain: "Myanmar[Burma]",
    url: "https://quiz.samsungplus.net/s25/NAT_3004_my",
    langCode: "my",
  },
  {
    domain: "Bangladesh",
    url: "https://quiz.samsungplus.net/s25/NAT_2050_bn",
    langCode: "bn",
  },
  {
    domain: "Nepal",
    url: "https://quiz.samsungplus.net/s25/NAT_060401_en-US",
    langCode: "en-US",
  },
  {
    domain: "India",
    url: "https://quiz.samsungplus.net/s25/NAT_2356_en-US",
    langCode: "en-US",
  },
  {
    domain: "SriLanka",
    url: "https://quiz.samsungplus.net/s25/NAT_2144_en-US",
    langCode: "en-US",
  },
  {
    domain: "Egypt",
    url: "https://quiz.samsungplus.net/s25/NAT_2818_en-US",
    langCode: "en-US",
  },
  {
    domain: "Israel",
    url: "https://quiz.samsungplus.net/s25/NAT_37602_he",
    langCode: "he",
  },
  {
    domain: "Palestine",
    url: "https://quiz.samsungplus.net/s25/NAT_2275_ar-AE",
    langCode: "ar-AE",
  },
  {
    domain: "Jordan",
    url: "https://quiz.samsungplus.net/s25/NAT_2400_ar-AE",
    langCode: "ar-AE",
  },
  {
    domain: "Iraq",
    url: "https://quiz.samsungplus.net/s25/NAT_2368_ar-AE",
    langCode: "ar-AE",
  },
  {
    domain: "Lebanon",
    url: "https://quiz.samsungplus.net/s25/NAT_2422_en-US",
    langCode: "en-US",
  },
  {
    domain: "Morocco",
    url: "https://quiz.samsungplus.net/s25/NAT_2504_fr-FR",
    langCode: "fr-FR",
  },
  {
    domain: "Tunisia",
    url: "https://quiz.samsungplus.net/s25/NAT_2788_fr-FR",
    langCode: "fr-FR",
  },
  {
    domain: "Algeria",
    url: "https://quiz.samsungplus.net/s25/NAT_2012_fr-FR",
    langCode: "fr-FR",
  },
  {
    domain: "Pakistan",
    url: "https://quiz.samsungplus.net/s25/NAT_2586_en-US",
    langCode: "en-US",
  },
  {
    domain: "SaudiArabia",
    url: "https://quiz.samsungplus.net/s25/NAT_2682_ar-AE",
    langCode: "ar-AE",
  },
  {
    domain: "Turkey",
    url: "https://quiz.samsungplus.net/s25/NAT_2792_tr",
    langCode: "tr",
  },
  {
    domain: "UnitedArabEmirates",
    url: "https://quiz.samsungplus.net/s25/NAT_2784_en-US",
    langCode: "en-US",
  },
  {
    domain: "Bahrain",
    url: "https://quiz.samsungplus.net/s25/NAT_2048_en-US",
    langCode: "en-US",
  },
  {
    domain: "Kuwait",
    url: "https://quiz.samsungplus.net/s25/NAT_2414_en-US",
    langCode: "en-US",
  },
  {
    domain: "Oman",
    url: "https://quiz.samsungplus.net/s25/NAT_2512_en-US",
    langCode: "en-US",
  },
  {
    domain: "Qatar",
    url: "https://quiz.samsungplus.net/s25/NAT_2634_en-US",
    langCode: "en-US",
  },
  {
    domain: "Colombia",
    url: "https://quiz.samsungplus.net/s25/NAT_2170_es-LTN",
    langCode: "es-LTN",
  },
  {
    domain: "Argentina",
    url: "https://quiz.samsungplus.net/s25/NAT_2707_es-LTN",
    langCode: "es-LTN",
  },
  {
    domain: "Chile",
    url: "https://quiz.samsungplus.net/s25/NAT_2152_es-LTN",
    langCode: "es-LTN",
  },
  {
    domain: "Bolivia",
    url: "https://quiz.samsungplus.net/s25/NAT_2068_es-LTN",
    langCode: "es-LTN",
  },
  {
    domain: "Brazil",
    url: "https://quiz.samsungplus.net/s25/NAT_2076_pt-BR",
    langCode: "pt-BR",
  },
  {
    domain: "Trinidadandtobago",
    url: "https://quiz.samsungplus.net/s25/NAT_2780_en-US",
    langCode: "en-US",
  },
  {
    domain: "PuertoRico",
    url: "https://quiz.samsungplus.net/s25/NAT_2630_en-US",
    langCode: "en-US",
  },
  {
    domain: "Panama",
    url: "https://quiz.samsungplus.net/s25/NAT_2591_es-LTN",
    langCode: "es-LTN",
  },
  {
    domain: "Ecuador",
    url: "https://quiz.samsungplus.net/s25/NAT_2218_es-LTN",
    langCode: "es-LTN",
  },
  {
    domain: "CostaRica",
    url: "https://quiz.samsungplus.net/s25/NAT_2188_es-LTN",
    langCode: "es-LTN",
  },
  {
    domain: "DominicanRepublic",
    url: "https://quiz.samsungplus.net/s25/NAT_2212_es-LTN",
    langCode: "es-LTN",
  },
  {
    domain: "Jamaica",
    url: "https://quiz.samsungplus.net/s25/NAT_2388_en-US",
    langCode: "en-US",
  },
  {
    domain: "Guatemala",
    url: "https://quiz.samsungplus.net/s25/NAT_2631_es-LTN",
    langCode: "es-LTN",
  },
  {
    domain: "Honduras",
    url: "https://quiz.samsungplus.net/s25/NAT_2633_es-LTN",
    langCode: "es-LTN",
  },
  {
    domain: "Nicaragua",
    url: "https://quiz.samsungplus.net/s25/NAT_2635_es-LTN",
    langCode: "es-LTN",
  },
  {
    domain: "ElSalvador",
    url: "https://quiz.samsungplus.net/s25/NAT_2632_es-LTN",
    langCode: "es-LTN",
  },
  {
    domain: "Paraguay",
    url: "https://quiz.samsungplus.net/s25/NAT_2600_es-LTN",
    langCode: "es-LTN",
  },
  {
    domain: "Uruguay",
    url: "https://quiz.samsungplus.net/s25/NAT_2858_es-LTN",
    langCode: "es-LTN",
  },
  {
    domain: "Venezuela",
    url: "https://quiz.samsungplus.net/s25/NAT_2862_es-LTN",
    langCode: "es-LTN",
  },
  {
    domain: "Mexico",
    url: "https://quiz.samsungplus.net/s25/NAT_2484_es-LTN",
    langCode: "es-LTN",
  },
  {
    domain: "Peru",
    url: "https://quiz.samsungplus.net/s25/NAT_2604_es-LTN",
    langCode: "es-LTN",
  },
  {
    domain: "Kenya",
    url: "https://quiz.samsungplus.net/s25/NAT_2404_es-LTN",
    langCode: "es-LTN",
  },
  {
    domain: "Nigeria",
    url: "https://quiz.samsungplus.net/s25/NAT_2566_en-US",
    langCode: "en-US",
  },
  {
    domain: "Senegal",
    url: "https://quiz.samsungplus.net/s25/NAT_2686_fr-FR",
    langCode: "fr-FR",
  },
  {
    domain: "Cameroon",
    url: "https://quiz.samsungplus.net/s25/NAT_120_fr-FR",
    langCode: "fr-FR",
  },
  {
    domain: "Ghana",
    url: "https://quiz.samsungplus.net/s25/NAT_2288_en-US",
    langCode: "en-US",
  },
  {
    domain: "IvoryCoast",
    url: "https://quiz.samsungplus.net/s25/NAT_384_fr-FR",
    langCode: "fr-FR",
  },
  {
    domain: "Mauritius",
    url: "https://quiz.samsungplus.net/s25/NAT_3701_en-US",
    langCode: "en-US",
  },
  {
    domain: "SouthAfrica",
    url: "https://quiz.samsungplus.net/s25/NAT_2710_en-US",
    langCode: "en-US",
  },
  {
    domain: "Japan",
    url: "https://quiz.samsungplus.net/s25/NAT_2392_ja",
    langCode: "ja",
  },
  {
    domain: "Japan_GalaxyHarajuku",
    url: "https://quiz.samsungplus.net/s25/NAT_23961_ja",
    langCode: "ja",
  },
];

const notParticipateCountries = [
  "USA",
  "Canada",
  "Netherland",
  "Belgium",
  "Luxembourg",
  "Germany",
  "UnitedKingdom",
  "China",
  "NewZealand",
];

export default function SitemapPage() {
  const supportedLanguagesCode = defaultLanguages.map((lang) => lang.code);
  const HOST_URL = process.env.AUTH_URL;

  return (
    <div className="min-w-[280px] max-w-screen-md w-full min-h-svh mx-auto text-base px-10 pt-10 py-20">
      <div className="mb-[50px]">
        <h1 className="text-3xl">번역 검수 리스트</h1>
      </div>
      <p className="font-light">
        Language 개수: {supportedLanguagesCode.length} / Languages.json 기준
      </p>
      <p className="text-sm font-light text-red-600">
        (붉은배경은 번역본이 없는 국가입니다.)
      </p>
      <div className="mt-[30px] grid grid-cols-1 lg:grid-cols-2 gap-4">
        {domainUrlMapping.map(({ domain, url, langCode }) => {
          return (
            <a
              href={notParticipateCountries.includes(domain) ? undefined : url}
              target="_blank"
              key={url}
            >
              <Button
                variant={"outline"}
                className={cn(
                  "w-full whitespace-break-spaces disabled:bg-disabled"
                )}
                disabled={notParticipateCountries.includes(domain)}
              >
                {domain} 👉🏻 {langCode}
              </Button>
            </a>
          );
        })}
      </div>
    </div>
  );
}

// function getKeyByValue(object, value) {
//   return Object.keys(object).find((key) => object[key] === value);
// }
