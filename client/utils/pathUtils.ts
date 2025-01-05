export function extractCodesFromPath(path: string): {
  domainCode: string;
  languageCode: string;
} {
  if (!path || typeof path !== "string") {
    throw new Error("Invalid input: path must be a non-empty string");
  }

  // Match the pattern "domainCode_jobCode_languageCode"
  const match = path.match(/^(.*)_(.*?)$/);

  if (!match) {
    throw new Error(
      `Invalid path format: "${path}". Expected format is "domainCode_languageCode".`
    );
  }

  const [, domainCode, languageCode] = match;

  // Ensure all parts are non-empty
  if (!domainCode || !languageCode) {
    throw new Error(
      `Invalid path format: "${path}". Expected format is "domainCode_languageCode".`
    );
  }

  return { domainCode, languageCode };
}
