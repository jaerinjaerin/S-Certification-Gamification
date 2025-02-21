import {
  Image,
  Language,
  Question,
  QuestionOption,
  QuizBadge,
  QuizSet,
  QuizSetFile,
  QuizStage,
} from '@prisma/client';

export interface QuizSetEx extends QuizSet {
  domain: Domain;
  language: Language;
  subsidiary: Subsidiary | null;
  quizStages: QuizStageEx[];
}

export interface QuizSetWithFile {
  quizSet: QuizSetEx;
  quizSetFile: QuizSetFile;
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
