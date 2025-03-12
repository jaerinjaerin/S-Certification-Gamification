// src/types/apiTypes.ts

import { ErrorCode } from '@/app/constants/error-codes';
import {
  Campaign,
  CampaignSettings,
  Domain,
  Image,
  Language,
  Question,
  QuestionOption,
  QuizBadge,
  QuizSet,
  QuizStage,
  Region,
  Subsidiary,
  UserQuizLog,
  UserQuizQuestionLog,
  UserQuizStageLog,
} from '@prisma/client';

export interface QuizSetEx extends QuizSet {
  domain: Domain & {
    subsidiary: Subsidiary & {
      region: Region;
    };
  };
  campaign: CampaignEx;
  language: Language | null;
  quizStages: QuizStageEx[];
  // subsidiary: Subsidiary | null;
}

export interface CampaignEx extends Campaign {
  settings: CampaignSettings;
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
  // quizQuestionLogs: UserQuizQuestionLog[] | null;
}

export interface QuizQuestionLogsResponse {
  items: UserQuizQuestionLog[] | null;
}

export interface QuizStageLogResponse {
  item: UserQuizStageLog | null;
}

export interface DomainsResponse {
  items: Domain[];
}

export interface LanguagesResponse {
  items: Language[];
}

export interface ApiResponse<T> {
  success: boolean;
  result: {
    item: T | null;
  };
  error?: {
    message: string;
    code: ErrorCode;
  };
}

export interface ApiListResponse<T> {
  items: T[] | null;
  success: boolean;
  message?: string;
}

export interface ChannelLanguage {
  id: string;
  code: string;
  name: string;
}

export interface ChannelJob {
  id: string;
  name: string;
  group: string;
}

export interface Channel {
  name: string;
  job: ChannelJob;
  channelId: string;
  channelSegment: string;
  channelSegmentId: string;
}

export interface DomainChannel {
  id: string;
  name: string;
  code: string;
  regionId: string;
  region: Region;
  subsidiary: Subsidiary;
  subsidiaryId: string;
  isReady: boolean;
  languages: JobQuizLanguage;
  channels: Channel[];
}

interface QuizLanguage {
  id: string;
  code: string;
  name: string;
}
interface JobQuizLanguage {
  ff: QuizLanguage[];
  fsm: QuizLanguage[];
}
