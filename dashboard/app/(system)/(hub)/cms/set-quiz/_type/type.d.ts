import { DomainData } from '@/lib/nomember-excel-parser';
import type {
  QuizSet,
  Domain,
  Subsidiary,
  Region,
  Language,
  QuizStage,
  Question,
  QuestionOption,
  Image,
} from '@prisma/client';

export type UploadExcelFileVariant = 'quiz' | 'activityId' | 'non-s';

export type UploadExcelFileModalProps = {
  children: React.ReactNode;
  title: string;
  variant: UploadExcelFileVariant;
};
export interface GroupedQuizSet {
  quizSet: QuizSet & {
    domain: Domain & {
      subsidiary: Subsidiary & {
        region: Region;
      };
    };
    language: Language;
    quizStages: (QuizStage & {
      badgeImage: Image | null;
      questions: (Question & {
        options: QuestionOption[];
        backgroundImage: Image | null;
        characterImage: Image | null;
      })[];
    })[];
  };
  quizSetFile: QuizSetFile | undefined;
}

export interface ActivityBadgeWithImage extends ActivityBadge {
  badgeImage: Image | null;
}

export interface QuizSetResponse {
  success: boolean;
  result: {
    groupedQuizSets: GroupedQuizSet[];
    activityBadges: ActivityBadgeWithImage[];
  };
}

export interface NonSProcessResult {
  success: boolean;
  data?: DomainData[];
  errors?: { line: number; message: string }[];
}
