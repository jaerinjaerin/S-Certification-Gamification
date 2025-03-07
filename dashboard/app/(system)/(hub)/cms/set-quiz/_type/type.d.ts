import { DomainData } from '@/lib/nomember-excel-parser';
import { DomainChannel, QuizSetEx, QuizStageEx } from '@/types/apiTypes';
import type { ActivityBadge, Image, Language } from '@prisma/client';

export type UploadExcelFileVariant = 'quiz' | 'activityId' | 'non-s' | 'hq';

export type UploadExcelFileModalProps = {
  children: React.ReactNode;
  title: string;
  variant: UploadExcelFileVariant;
};

export interface GroupedQuizSet {
  quizSet: QuizSetEx;
  quizSetFile: QuizSetFile | undefined;
  activityBadges: ActivityBadge[] | undefined;
  uiLanguage: Language | null;
}

export interface DomainWebLanguageEx extends DomainWebLanguage {
  language: Language;
}

export interface ActivityBadgeWithImage extends ActivityBadge {
  badgeImage: Image | null;
}

export interface QuizSetResponse {
  success: boolean;
  result: {
    groupedQuizSets: GroupedQuizSet[];
  };
}

export interface NoServiceChannelsResponse {
  success: boolean;
  result: {
    channels: DomainChannel[];
  };
}

export interface NonSProcessResult {
  success: boolean;
  data?: DomainData[];
  errors?: { line: number; message: string }[];
}
