import { DomainData } from '@/lib/nomember-excel-parser';
import { DomainChannel, QuizSetEx } from '@/types/apiTypes';
import { DomainEx } from '@/types/type';
import type {
  ActivityBadge,
  CampaignSettings,
  Image,
  Language,
} from '@prisma/client';

export type UploadExcelFileVariant = 'quiz' | 'activityId' | 'non-s' | 'hq';

export type UploadExcelFileModalProps = {
  children: React.ReactNode;
  title: string;
  variant: UploadExcelFileVariant;
  onDropdownClose?: () => void;
};

export interface GroupedQuizSet {
  quizSet: QuizSetEx | null;
  quizSetFile: QuizSetFile | null;
  domain: DomainEx;
  campaign: CampaignEx;
  activityBadges: ActivityBadgeEx[] | null;
  uiLanguage: Language | null;
  campaignSettings: CampaignSettings;
}

export interface DomainWebLanguageEx extends DomainWebLanguage {
  language: Language;
}

export interface ActivityBadgeEx extends ActivityBadge {
  badgeImage: Image | null;
}

export interface QuizSetResponse {
  success: boolean;
  result: {
    groupedQuizSets: GroupedQuizSet[];
    campaignSettings: CampaignSettings;
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
