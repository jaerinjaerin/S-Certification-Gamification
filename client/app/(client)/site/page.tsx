"use client";

import { Button } from "@/components/ui/button";

import { cn } from "@/utils/utils";
import { defaultLanguages } from "@/core/config/default";

const domainUrlMapping = [
  {
    domain: "KOREA",
    url: `OrgCode-7_en-US`,
    langCode: "en-US",
  },
  {
    domain: "Canada",
    url: `NAT_7000_fr-CA`,
    langCode: "fr-CA",
  },
  {
    domain: "Canada",
    url: `NAT_7000_en-US`,
    langCode: "en-US",
  },
  {
    domain: "Albania",
    url: `NAT_2008_sq`,
    langCode: "sq",
  },
  {
    domain: "BosniaandHerzegovina",
    url: `NAT_2070_bs`,
    langCode: "bs",
  },
  {
    domain: "Croatia",
    url: `NAT_2191_hr-HR`,
    langCode: "hr-HR",
  },
  {
    domain: "Macedonia(FYROM)",
    url: `NAT_2807_mk`,
    langCode: "mk",
  },
  {
    domain: "Serbia",
    url: `NAT_2688_sr-Cyrl`,
    langCode: "sr-Cyrl",
  },
  {
    domain: "Slovenia",
    url: `NAT_2705_sl`,
    langCode: "sl",
  },
  {
    domain: "Switzerland",
    url: `NAT_2756_de-DE`,
    langCode: "de-DE",
  },
  {
    domain: "Switzerland",
    url: `NAT_2756_fr-FR`,
    langCode: "fr-FR",
  },
  {
    domain: "Switzerland",
    url: `NAT_2756_it-IT`,
    langCode: "it-IT",
  },
  {
    domain: "Switzerland",
    url: `NAT_2756_en-US`,
    langCode: "en-US",
  },
  {
    domain: "Austria",
    url: `NAT_2040_de-DE`,
    langCode: "de-DE",
  },
  {
    domain: "Estonia",
    url: `NAT_2233_et`,
    langCode: "et",
  },
  {
    domain: "Latvia",
    url: `NAT_2428_lv`,
    langCode: "lv",
  },
  {
    domain: "Lithuania",
    url: `NAT_2440_lt`,
    langCode: "lt",
  },
  {
    domain: "CzechRepublic",
    url: `NAT_2203_cs`,
    langCode: "cs",
  },
  {
    domain: "Slovakia",
    url: `NAT_2703_sk-SK`,
    langCode: "sk-SK",
  },
  {
    domain: "France",
    url: `NAT_2250_fr-FR`,
    langCode: "fr-FR",
  },
  {
    domain: "Greece",
    url: `NAT_2300_el`,
    langCode: "el",
  },
  {
    domain: "Cyprus",
    url: `NAT_19602_el`,
    langCode: "el",
  },
  {
    domain: "Hungary",
    url: `NAT_2348_hu`,
    langCode: "hu",
  },
  {
    domain: "Italy",
    url: `NAT_2380_it-IT`,
    langCode: "it-IT",
  },
  {
    domain: "Spain",
    url: `NAT_2724_es-ES`,
    langCode: "es-ES",
  },
  {
    domain: "Portugal",
    url: `NAT_2620_pt-PT`,
    langCode: "pt-PT",
  },
  {
    domain: "Sweden",
    url: `NAT_021501_sv`,
    langCode: "sv",
  },
  {
    domain: "Sweden",
    url: `NAT_021501_en-US`,
    langCode: "en-US",
  },
  {
    domain: "Finland",
    url: `NAT_021502_fi`,
    langCode: "fi",
  },
  {
    domain: "Norway",
    url: `NAT_021503_nb`,
    langCode: "nb",
  },
  {
    domain: "Denmark",
    url: `NAT_021504_da`,
    langCode: "da",
  },
  {
    domain: "Denmark",
    url: `NAT_021504_en-US`,
    langCode: "en-US",
  },
  {
    domain: "Poland",
    url: `NAT_2616_pl`,
    langCode: "pl",
  },
  {
    domain: "Bulgaria",
    url: `NAT_2100_bg`,
    langCode: "bg",
  },
  {
    domain: "Romania",
    url: `NAT_2642_ro`,
    langCode: "ro",
  },
  {
    domain: "Kazakhstan",
    url: `NAT_2398_ru`,
    langCode: "ru",
  },
  {
    domain: "Kyrgyzstan",
    url: `NAT_41702_ru`,
    langCode: "ru",
  },
  {
    domain: "Tajikistan",
    url: `NAT_76202_ru`,
    langCode: "ru",
  },
  {
    domain: "Uzbekistan",
    url: `NAT_2860_uz`,
    langCode: "uz",
  },
  {
    domain: "Russia",
    url: `NAT_2643_ru`,
    langCode: "ru",
  },
  {
    domain: "Azerbaijan",
    url: `NAT_2645_az`,
    langCode: "az",
  },
  {
    domain: "Georgia",
    url: `NAT_2644_ka`,
    langCode: "ka",
  },
  {
    domain: "China",
    url: `NAT_2156_zh-CN`,
    langCode: "zh-CN",
  },
  {
    domain: "Hongkong",
    url: `NAT_2344_zh-TW`,
    langCode: "zh-TW",
  },
  {
    domain: "Taiwan",
    url: `NAT_2158_zh-TW`,
    langCode: "zh-TW",
  },
  {
    domain: "Vietnam",
    url: `NAT_2704_vi`,
    langCode: "vi",
  },
  {
    domain: "Australia",
    url: `NAT_051001_en-US`,
    langCode: "en-US",
  },
  {
    domain: "Indonesia",
    url: `NAT_2360_id`,
    langCode: "id",
  },
  {
    domain: "NewZealand",
    url: `NAT_2554_en-US`,
    langCode: "en-US",
  },
  {
    domain: "Philippines",
    url: `NAT_2608_en-US`,
    langCode: "en-US",
  },
  {
    domain: "Singapore",
    url: `NAT_2702_en-US`,
    langCode: "en-US",
  },
  {
    domain: "Malaysia",
    url: `NAT_2458_en-US`,
    langCode: "en-US",
  },
  {
    domain: "Thailand",
    url: `NAT_2764_th`,
    langCode: "th",
  },
  {
    domain: "Cambodia",
    url: `NAT_2116_km`,
    langCode: "km",
  },
  {
    domain: "Laos",
    url: `NAT_2418_lo`,
    langCode: "lo",
  },
  {
    domain: "Myanmar[Burma]",
    url: `NAT_3004_my`,
    langCode: "my",
  },
  {
    domain: "Bangladesh",
    url: `NAT_2050_bn`,
    langCode: "bn",
  },
  {
    domain: "Nepal",
    url: `NAT_060401_en-US`,
    langCode: "en-US",
  },
  {
    domain: "India",
    url: `NAT_2356_en-US`,
    langCode: "en-US",
  },
  {
    domain: "SriLanka",
    url: `NAT_2144_en-US`,
    langCode: "en-US",
  },
  {
    domain: "Egypt",
    url: `NAT_2818_en-US`,
    langCode: "en-US",
  },
  {
    domain: "Israel",
    url: `NAT_37602_he`,
    langCode: "he",
  },
  {
    domain: "Palestine",
    url: `NAT_2275_ar-AE`,
    langCode: "ar-AE",
  },
  {
    domain: "Jordan",
    url: `NAT_2400_ar-AE`,
    langCode: "ar-AE",
  },
  {
    domain: "Iraq",
    url: `NAT_2368_ar-AE`,
    langCode: "ar-AE",
  },
  {
    domain: "Lebanon",
    url: `NAT_2422_en-US`,
    langCode: "en-US",
  },
  {
    domain: "Morocco",
    url: `NAT_2504_fr-FR`,
    langCode: "fr-FR",
  },
  {
    domain: "Tunisia",
    url: `NAT_2788_fr-FR`,
    langCode: "fr-FR",
  },
  {
    domain: "Algeria",
    url: `NAT_2012_fr-FR`,
    langCode: "fr-FR",
  },
  {
    domain: "Pakistan",
    url: `NAT_2586_en-US`,
    langCode: "en-US",
  },
  {
    domain: "SaudiArabia",
    url: `NAT_2682_ar-AE`,
    langCode: "ar-AE",
  },
  {
    domain: "Turkey",
    url: `NAT_2792_tr`,
    langCode: "tr",
  },
  {
    domain: "UnitedArabEmirates",
    url: `NAT_2784_en-US`,
    langCode: "en-US",
  },
  {
    domain: "Bahrain",
    url: `NAT_2048_en-US`,
    langCode: "en-US",
  },
  {
    domain: "Kuwait",
    url: `NAT_2414_en-US`,
    langCode: "en-US",
  },
  {
    domain: "Oman",
    url: `NAT_2512_en-US`,
    langCode: "en-US",
  },
  {
    domain: "Qatar",
    url: `NAT_2634_en-US`,
    langCode: "en-US",
  },
  {
    domain: "Colombia",
    url: `NAT_2170_es-LTN`,
    langCode: "es-LTN",
  },
  {
    domain: "Argentina",
    url: `NAT_2707_es-LTN`,
    langCode: "es-LTN",
  },
  {
    domain: "Chile",
    url: `NAT_2152_es-LTN`,
    langCode: "es-LTN",
  },
  {
    domain: "Bolivia",
    url: `NAT_2068_es-LTN`,
    langCode: "es-LTN",
  },
  {
    domain: "Brazil",
    url: `NAT_2076_pt-BR`,
    langCode: "pt-BR",
  },
  {
    domain: "Trinidadandtobago",
    url: `NAT_2780_en-US`,
    langCode: "en-US",
  },
  {
    domain: "PuertoRico",
    url: `NAT_2630_en-US`,
    langCode: "en-US",
  },
  {
    domain: "Panama",
    url: `NAT_2591_es-LTN`,
    langCode: "es-LTN",
  },
  {
    domain: "Ecuador",
    url: `NAT_2218_es-LTN`,
    langCode: "es-LTN",
  },
  {
    domain: "CostaRica",
    url: `NAT_2188_es-LTN`,
    langCode: "es-LTN",
  },
  {
    domain: "DominicanRepublic",
    url: `NAT_2212_es-LTN`,
    langCode: "es-LTN",
  },
  {
    domain: "Jamaica",
    url: `NAT_2388_en-US`,
    langCode: "en-US",
  },
  {
    domain: "Guatemala",
    url: `NAT_2631_es-LTN`,
    langCode: "es-LTN",
  },
  {
    domain: "Honduras",
    url: `NAT_2633_es-LTN`,
    langCode: "es-LTN",
  },
  {
    domain: "Nicaragua",
    url: `NAT_2635_es-LTN`,
    langCode: "es-LTN",
  },
  {
    domain: "ElSalvador",
    url: `NAT_2632_es-LTN`,
    langCode: "es-LTN",
  },
  {
    domain: "Paraguay",
    url: `NAT_2600_es-LTN`,
    langCode: "es-LTN",
  },
  {
    domain: "Uruguay",
    url: `NAT_2858_es-LTN`,
    langCode: "es-LTN",
  },
  {
    domain: "Venezuela",
    url: `NAT_2862_es-LTN`,
    langCode: "es-LTN",
  },
  {
    domain: "Mexico",
    url: `NAT_2484_es-LTN`,
    langCode: "es-LTN",
  },
  {
    domain: "Peru",
    url: `NAT_2604_es-LTN`,
    langCode: "es-LTN",
  },
  {
    domain: "Kenya",
    url: `NAT_2404_es-LTN`,
    langCode: "es-LTN",
  },
  {
    domain: "Nigeria",
    url: `NAT_2566_en-US`,
    langCode: "en-US",
  },
  {
    domain: "Senegal",
    url: `NAT_2686_fr-FR`,
    langCode: "fr-FR",
  },
  {
    domain: "Cameroon",
    url: `NAT_120_fr-FR`,
    langCode: "fr-FR",
  },
  {
    domain: "Ghana",
    url: `NAT_2288_en-US`,
    langCode: "en-US",
  },
  {
    domain: "IvoryCoast",
    url: `NAT_384_fr-FR`,
    langCode: "fr-FR",
  },
  {
    domain: "Mauritius",
    url: `NAT_3701_en-US`,
    langCode: "en-US",
  },
  {
    domain: "SouthAfrica",
    url: `NAT_2710_en-US`,
    langCode: "en-US",
  },
  {
    domain: "Japan",
    url: `NAT_2392_ja`,
    langCode: "ja",
  },
  {
    domain: "Japan_GalaxyHarajuku",
    url: `NAT_23961_ja`,
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
          console.log(`${process.env.NEXT_PUBLIC_API_URL}/s25/${url}`);
          return (
            <a
              href={
                notParticipateCountries.includes(domain)
                  ? undefined
                  : `${process.env.NEXT_PUBLIC_API_URL}/s25/${url}`
              }
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
