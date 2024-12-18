import { isValidCampaignQuizSetId } from "./validationUtils";

describe("isValidCampaignQuizSetId", () => {
  test("should return true for valid campaign quiz set IDs", () => {
    const validIds = [
      "NAT_23961_fsm_ja", // 기본 케이스
      "ABC-123_ff_en-US", // 하이픈 사용
      "TEST_456_test_ja", // 언더바 포함 2개 이상 구분자
      "A1-B2_C3_D4", // 다양한 구분자 조합
    ];

    validIds.forEach((id) => {
      expect(isValidCampaignQuizSetId(id)).toBe(true);
    });
  });

  test("should return false for invalid campaign quiz set IDs", () => {
    const invalidIds = [
      "NAT23961fsm", // 구분자가 없음
      "NAT_23961", // 구분자가 1개만 있음
      "_23961_fsm_ja", // 시작이 구분자로 시작
      "NAT__fsm_ja", // 연속된 구분자
      "NAT-23961-", // 끝이 구분자로 끝남
      "NAT 23961 fsm ja", // 공백 포함
      "NAT-@!_fsm_ja", // 특수문자 포함
    ];

    invalidIds.forEach((id) => {
      expect(isValidCampaignQuizSetId(id)).toBe(false);
    });
  });
});
