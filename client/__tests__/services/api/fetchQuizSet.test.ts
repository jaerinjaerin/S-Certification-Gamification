import { fetchQuizSet } from "@/services/api/fetchQuizSet";
import { ApiResponse, QuizSetEx } from "@/types/apiTypes";
import fetchMock from "jest-fetch-mock";

describe("fetchQuizSet API 모킹 테스트", () => {
  beforeEach(() => {
    fetchMock.resetMocks(); // 매 테스트 전에 fetch 모킹 초기화
    jest.useFakeTimers(); // 타이머 사용
  });

  afterEach(() => {
    fetchMock.resetMocks();
    jest.useFakeTimers(); // 타이머 사용
  });

  it("✅ API 요청이 정상적으로 수행되고 응답이 반환되는지 확인", async () => {
    // 🔥 특정 URL 요청 시 모킹된 응답을 반환하도록 설정
    fetchMock.mockResponseOnce(
      JSON.stringify({
        item: { id: "quiz1", campaignId: "test_campaign_id" },
        success: true,
        message: "테스트 응답",
        status: 200,
      })
    );

    const response: ApiResponse<QuizSetEx> = await fetchQuizSet(
      "test-quiz",
      "user123"
    );

    console.log("test response", response);

    // ✅ API 응답이 올바르게 반환되는지 확인
    expect(response.success).toBe(true);
    expect(response.item?.id).toBe("quiz1");
    expect(response.item?.campaignId).toBe("test_campaign_id");
    expect(fetchMock).toHaveBeenCalledTimes(1); // API 호출이 1번만 발생해야 함
  });

  it("✅ 캐시가 유지되는 동안 API 호출이 발생하지 않는지 확인", async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        item: { id: "quiz2", campaignId: "test_campaign_id_2" },
        success: true,
        status: 200,
      })
    );

    const quizsetPath = "test-quiz-2";
    const userId = "user123";

    // 첫 번째 호출: API 요청 발생
    const response1 = await fetchQuizSet(quizsetPath, userId);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(response1.item?.campaignId).toBe("test_campaign_id_2");

    // 두 번째 호출: 캐시된 데이터 반환 (API 호출 없어야 함)
    const response2 = await fetchQuizSet(quizsetPath, userId);
    expect(fetchMock).toHaveBeenCalledTimes(1); // API 호출 횟수가 증가하지 않아야 함
    expect(response2.item).toEqual(response1.item);
  });

  it("✅ 캐시가 만료되었을 때 새로운 API 요청을 수행하는지 확인", async () => {
    fetchMock.mockResponse(
      JSON.stringify({
        item: { id: "quiz3", campaignId: "test_campaign_id_3" },
        success: true,
        status: 200,
      })
    );

    const quizsetPath = "test-quiz-expire";
    const userId = "user123";

    // 첫 번째 호출: API 요청 발생
    await fetchQuizSet(quizsetPath, userId);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // ⏳ 인위적으로 캐시 만료 시뮬레이션
    jest.advanceTimersByTime(11 * 60 * 1000); // 11분 경과 (CACHE_DURATION 초과)

    // 두 번째 호출: 캐시가 만료되었으므로 API 요청이 다시 발생해야 함
    await fetchQuizSet(quizsetPath, userId);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("✅ 30분이 지나면 캐시가 삭제되는지 확인", async () => {
    fetchMock.mockResponse(
      JSON.stringify({
        item: { id: "quiz4", campaignId: "test_campaign_id_4" },
        success: true,
        message: "테스트 응답",
        status: 200,
      })
    );

    const quizsetPath = "test-quiz-clear";
    const userId = "user123";

    // 첫 번째 호출: API 요청 발생
    await fetchQuizSet(quizsetPath, userId);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // ⏳ 31분 경과 (캐시 TTL 초과)
    jest.advanceTimersByTime(31 * 60 * 1000);

    // 두 번째 호출: 캐시가 삭제되었으므로 API 요청이 다시 발생해야 함
    await fetchQuizSet(quizsetPath, userId);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("✅ API 응답이 실패했을 때 예외 처리 확인", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ message: "오류 발생" }), {
      status: 500,
    });

    const quizsetPath = "test-quiz-fail";
    const userId = "user123";

    const response = await fetchQuizSet(quizsetPath, userId);

    expect(response.success).toBe(false);
    expect(response.item).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("fetchQuizSet 캐시 삭제 테스트", () => {
  beforeAll(() => {
    jest.useFakeTimers({ now: Date.now() }); // ✅ Jest가 `Date.now()`도 관리하도록 설정
  });

  afterAll(() => {
    jest.useRealTimers(); // ✅ 테스트 후 원래 타이머 복구
  });

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("✅ 30분 후 캐시가 삭제되었는지 확인", async () => {
    const quizsetPath = "test-quiz-clear-2";
    const userId = "user123";

    fetchMock.mockResponse(
      JSON.stringify({
        item: { id: "quiz4", campaignId: "test_campaign_id" },
        success: true,
        message: "퀴즈 세트를 성공적으로 가져왔습니다.",
        status: 200,
      })
    );

    // 🕒 첫 번째 요청: API 요청 발생 + 캐시에 저장
    await fetchQuizSet(quizsetPath, userId);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // ⏳ 30분 후 시스템 시간을 강제로 조작 (Date.now()도 조작됨)
    jest.setSystemTime(Date.now() + 30 * 60 * 1000);

    await jest.runAllTimersAsync(); // ✅ 모든 타이머 실행 후 fetch 실행

    await fetchQuizSet(quizsetPath, userId);
    expect(fetchMock).toHaveBeenCalledTimes(2); // ✅ 캐시 삭제 후 새로운 요청 발생
  });
});
