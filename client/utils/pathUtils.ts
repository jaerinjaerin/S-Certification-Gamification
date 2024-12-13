export function extractCodesFromPath(path: string): {
  domainCode: string;
  jobCode: string;
  languageCode: string;
} {
  if (!path || typeof path !== "string") {
    throw new Error("Invalid input: path must be a non-empty string");
  }

  // Match the pattern "domainCode_jobCode_languageCode"
  const match = path.match(/^(.*)_(.*?)_(.*?)$/);

  if (!match) {
    throw new Error(
      `Invalid path format: "${path}". Expected format is "domainCode_job_languageCode".`
    );
  }

  const [, domainCode, jobCode, languageCode] = match;

  // Ensure all parts are non-empty
  if (!domainCode || !jobCode || !languageCode) {
    throw new Error(
      `Invalid path format: "${path}". Expected format is "domainCode_job_languageCode".`
    );
  }

  return { domainCode, jobCode, languageCode };
}
