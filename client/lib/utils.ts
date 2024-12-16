import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fixedClass = `fixed w-full max-w-[412px] left-1/2 -translate-x-1/2`;
