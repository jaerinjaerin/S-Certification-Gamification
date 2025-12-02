import { ActivityBadge, QuizBadge, QuizSetFile } from '@prisma/client';
import { QuizSetEx } from './types/apiTypes';

export interface ActivityBadgeEx extends ActivityBadge {
  badgeImage: QuizBadge | null;
}

export interface QuizSetWithFile {
  quizSet: QuizSetEx;
  quizSetFile: QuizSetFile;
}

export enum ReadyStatus {
  READY = 'READY',
  PARTIALLY_READY = 'PARTIALLY_READY',
  NOT_READY = 'NOT_READY',
}
