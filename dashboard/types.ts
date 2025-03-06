import { ActivityBadge, QuizBadge, QuizSetFile } from '@prisma/client';
import { QuizSetEx } from './types/apiTypes';

export interface ActivityBadgeEx extends ActivityBadge {
  badgeImage: QuizBadge | null;
}

export interface QuizSetWithFile {
  quizSet: QuizSetEx;
  quizSetFile: QuizSetFile;
}

// types/apiTypes.ts 에서 정의한 타입을 사용하는 것으로 변경
// export interface QuizStageEx extends QuizStage {
//   questions: QuestionEx[];
//   badgeImage: QuizBadge | null;
// }

// export interface QuestionEx extends Question {
//   options: QuestionOption[];
//   backgroundImage: Image | null;
//   characterImage: Image | null;
// }

// export interface QuizSetEx extends QuizSet {
//   domain: Domain;
//   language: Language;
//   subsidiary: Subsidiary | null;
//   quizStages: QuizStageEx[];
// }
