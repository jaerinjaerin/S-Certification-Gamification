import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { defaultLanguagesByRegion } from "@/core/config/default";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fixedClass = `fixed w-full max-w-[412px] left-1/2 -translate-x-1/2`;

export function formatToMMSS(value: number) {
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;

  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = seconds.toString().padStart(2, "0");
  return `${formattedMinutes}:${formattedSeconds}`;
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function isSheetLanguage(locale: string) {
  const isMENALanguage = defaultLanguagesByRegion.MENA.includes(locale);
  const isKoreaLanguage = locale === "ko";

  if (isKoreaLanguage || isMENALanguage) {
    return true;
  }
  // return boolean
  return false;
}
