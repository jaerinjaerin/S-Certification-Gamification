export const QUIZ_CONSTANTS = {
  ANIMATION: {
    DURATION: 3000,
  },
  LIFE: {
    DEFAULT_COUNT: 5,
  },
  UI: {
    SUCCESS_DELAY: 1500,
  },
  PROGRESS: {
    MAX: 100,
  },
} as const;

export const QUIZ_ERROR_MESSAGES = {
  STAGE_NOT_FOUND: "퀴즈 스테이지를 찾을 수 없습니다.",
  NETWORK_ERROR: "네트워크 오류가 발생했습니다.",
} as const;
