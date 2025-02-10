const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  testEnvironment: "jest-environment-jsdom", // 명시적으로 설정
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/app/$1", // "@/..."를 "app/..."로 매핑
    "^.+\\.(css|scss)$": "identity-obj-proxy",
  },
  silent: false, // console.log를 항상 출력
};

module.exports = createJestConfig(customJestConfig);
