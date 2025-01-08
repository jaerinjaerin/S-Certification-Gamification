module.exports = {
  apps: [
    {
      name: "squiz", // 애플리케이션 이름
      script: "npm", // 실행할 명령어
      args: "start", // npm 명령의 인자
      exec_mode: "cluster", // 클러스터 모드
      instances: 3, // CPU 코어 수만큼 인스턴스 실행
      autorestart: true, // 프로세스가 죽으면 자동 재시작
      watch: false, // 파일 변경 감지 비활성화
      max_restarts: 5, // 최대 재시작 횟수
      restart_delay: 5000, // 재시작 간격 (ms)
      error_file: "./logs/squiz-error.log", // 에러 로그 파일 경로
      out_file: "./logs/squiz-output.log", // 일반 로그 파일 경로
      log_date_format: "YYYY-MM-DD HH:mm:ss", // 로그 시간 형식
      // env: {
      //   NODE_ENV: "production", // 환경 변수 (production 모드)
      // },
      // env_development: {
      //   NODE_ENV: "development", // 개발 모드 환경 변수
      // },
      env: {
        PORT: 3000, // 각 프로세스가 환경 변수를 통해 포트 설정
      },
      post_exit: "node notify-sentry.js",
    },
  ],
};
