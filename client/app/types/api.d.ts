/*
// 퀴즈 버전 또는 에디션 (전체 업데이트 개념)
export interface QuizCampaign {
  id: string;
  title: string; // 예: "New Product Quiz - Fall 2024 Edition"
  releaseDate: string; // 출시 날짜
}

// 부가적인 메타 정보 타입 정의
export interface QuizMetadata {
  id: string;
  serviceEntity: string; // 지법인 정보
  country: string; // 국가 정보
  language: string; // 언어 정보
  campaign: QuizCampaign;
}

// 개별 선택지 타입 정의
export interface QuizOption {
  id: string;
  text: string;
}

// 문제 타입 정의 (여러 선택지 포함)
export interface QuizQuestion {
  id: string;
  questionText: string;
  options: QuizOption[];
  correctOptionId: string; // 정답 선택지 ID
}

export interface QuizSet {
  id: string;
  title: string;
  timeLimitSeconds: number;
  lives: number;
  stage: number;
  nextStage: number | null;
  questions: QuizQuestion[];
  metadata: QuizMetadata;
}
*/
// 오류 상세 정보 타입
export interface ErrorDetails {
  code: string; // 오류 코드
  details: string; // 오류 세부 설명
}

// 성공 응답 형식
export interface SuccessResponse<T> {
  status: number; // HTTP 상태 코드 (예: 200, 201 등)
  message: string; // 성공 메시지
  data: T; // 성공 시 반환할 데이터
}

// 실패 응답 형식
export interface ErrorResponse {
  status: number; // HTTP 상태 코드 (예: 400, 404, 500 등)
  message: string; // 오류 메시지
  error: ErrorDetails; // 오류 상세 정보
}

// API 응답 형식 (성공 또는 실패)
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// 퀴즈 세트 API 응답 타입
export interface QuizSetApiResponse extends ApiResponse<QuizSet> {}
