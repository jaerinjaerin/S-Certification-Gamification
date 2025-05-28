import { ExtractCodesFromPathReturn } from "@/types/utils/types";
import assert from "assert";

export function extractCodesFromPath(path: string): ExtractCodesFromPathReturn | null {
  if (!path || typeof path !== "string") {
    assert(false, "Invalid input: path must be a non-empty string");
    return null;
  }

  // Match the pattern "domainCode_jobCode_languageCode"
  const match = path.match(/^(.*)_(.*?)$/);

  if (!match) {
    console.error(`Invalid path format: "${path}". Expected format is "domainCode_languageCode".`);
    return null;
  }

  const [, domainCode, languageCode] = match;

  // Ensure all parts are non-empty
  if (!domainCode || !languageCode) {
    console.error(`Invalid path format: "${path}". Expected format is "domainCode_languageCode".`);
    return null;
  }

  return { domainCode, languageCode };
}
