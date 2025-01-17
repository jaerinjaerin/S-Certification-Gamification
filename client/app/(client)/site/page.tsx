"use client";

import { Button } from "@/components/ui/button";
import { matchingTable } from "@/utils/codeMatchingTable";
import { cn } from "@/utils/utils";
import Languages from "../../../../upload_seed_data/data/seeds/languages.json";

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
      <p className="text-sm font-light text-red-600">
        (붉은배경은 번역본이 없는 국가입니다.)
      </p>
      <div className="mt-[30px] grid grid-cols-2 gap-4">
        {supportedLanguagesCode.map((code) => {
          return (
            <a
              href={`${HOST_URL}/s25/NAT_7000_${code}/login`}
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

function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}
