import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";
import { locales } from "./config";

export const routing = defineRouting({
  locales: locales,
  defaultLocale: "en-US",
});

// export type Pathnames = keyof typeof routing.pathnames;
// export type Locale = (typeof routing.locales)[number];

export const { Link, getPathname, redirect, usePathname, useRouter } =
  createNavigation(routing);

// function extractLocaleFromUrl(url: string): string | null {
//   const match = url.match(/_([a-z]{2}-[A-Z]{2})/);
//   return match ? match[1] : null;
// }
