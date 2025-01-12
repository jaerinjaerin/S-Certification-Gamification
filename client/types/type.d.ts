import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

// type QuizSetEx = QuizSet & {
//   language: Language;
//   campaign: Campaign;
//   domain: Domain;
//   quizStages: QuizStageEx[];
// };

// type QuizStageEx = QuizStage & {
//   questions: Questions[];
// };

// type QuestionEx = QuestionEx & {
//   options: QuestionOption[];
// };

type DomainEx = Domain & {
  channelSegments: ChannelSegmentEx[];
};

type ChannelSegmentEx = ChannelSegment & {
  salesFormats: SalesFormatEx[];
};

type SalesFormatEx = SalesFormat & {
  job: Job;
};

type IconProps = {
  children?: never;
  color?: string;
  accent?: boolean;
} & React.SVGAttributes<SVGElement>;

interface CustomError extends Error {
  error?: {
    name?: string;
    code?: string;
  };
}

// 각 데이터 항목에 대한 타입 정의
export interface DataItem {
  range: string; // 범위 ("0-9", "10-19" 등)
  count: number; // 해당 범위에 속하는 사용자 수
  userIncluded: boolean; // 사용자가 이 범위에 포함되어 있는지 여부
}

// userBin 타입 정의
export interface UserBin {
  range: string; // 사용자가 속한 범위 ("0-9" 등)
  count: number; // 해당 범위에 속하는 사용자 수
}

// 전체 데이터 구조 타입 정의
export interface ScoreData {
  data: DataItem[]; // 점수 범위에 따른 데이터 배열
  sampleSize: number | null; // 전체 샘플 크기
  userBin: UserBin | null; // 사용자가 속한 범위 정보
  userScore: number; // 사용자의 점수
  percentile: number | null; // 상위 %
}

export interface EndStageResult {
  score: ScoreData;
  isBadgeAcquired: boolean;
  badgeStage: boolean;
  badgeImageURL: string;
}
