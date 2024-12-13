import { extractCodesFromPath } from "./pathUtils";

describe("extractCodesFromPath", () => {
  it("should correctly extract domainCode, jobCode, and languageCode for a valid input", () => {
    const input = "ORG_502_ff_ko";
    const expectedOutput = {
      domainCode: "ORG_502",
      jobCode: "ff",
      languageCode: "ko",
    };

    expect(extractCodesFromPath(input)).toEqual(expectedOutput);
  });

  // it("should throw an error if input is not a string", () => {
  //   // Invalid input cases
  //   const invalidInputs = [null, undefined, 123, {}, []];

  //   invalidInputs.forEach((input) => {
  //     expect(() => extractCodesFromPath(input as unknown as string)).toThrow(
  //       "Invalid input: path must be a non-empty string"
  //     );
  //   });
  // });

  // it("should throw an error if input is an empty string", () => {
  //   expect(() => extractCodesFromPath("")).toThrow(
  //     "Invalid input: path must be a non-empty string"
  //   );
  // });

  // it("should throw an error if input format is invalid", () => {
  //   const invalidInputs = ["ORG_502", "ORG_502_ff", "ORG_ff"];

  //   invalidInputs.forEach((input) => {
  //     expect(() => extractCodesFromPath(input)).toThrow(
  //       `Invalid path format: "${input}". Expected format is "domainCode_job_languageCode".`
  //     );
  //   });
  // });
});
