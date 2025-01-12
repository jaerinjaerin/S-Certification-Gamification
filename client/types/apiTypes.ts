// src/types/apiTypes.ts

import {
  Domain,
  Image,
  Question,
  QuestionOption,
  QuizBadge,
  QuizSet,
  QuizStage,
  Subsidiary,
  UserQuizLog,
  UserQuizQuestionLog,
  UserQuizStageLog,
} from "@prisma/client";

export interface QuizSetEx extends QuizSet {
  domain: Domain;
  subsidiary: Subsidiary | null;
  quizStages: QuizStageEx[];
}

export interface QuizStageEx extends QuizStage {
  questions: QuestionEx[];
  badgeImage: QuizBadge | null;
}

export interface QuestionEx extends Question {
  options: QuestionOption[];
  backgroundImage: Image | null;
  characterImage: Image | null;
}

export interface QuizLogResponse {
  quizLog: UserQuizLog | null;
  quizStageLogs: UserQuizStageLog[] | null;
  quizQuestionLogs: UserQuizQuestionLog[] | null;
}

export interface ApiResponse<T> {
  item: T | null;
  success: boolean;
  message?: string;
}
