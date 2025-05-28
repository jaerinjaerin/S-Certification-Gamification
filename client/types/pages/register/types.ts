export interface Job {
  name: string;
  group: string;
  id: string;
  value: string;
  storeId?: string;
}

export interface Channel {
  name: string;
  job: Job;
  channelId: string;
  channelSegmentId: string;
}

export interface QuizLanguage {
  id: string;
  code: string;
  name: string;
}

export interface JobQuizLanguage {
  ff: QuizLanguage[];
  fsm: QuizLanguage[];
}

export interface DomainDetail {
  id: string;
  channels: Channel[];
  name: string;
  code: string;
  regionId: string;
  subsidiaryId: string;
  isReady: false;
  languages: JobQuizLanguage;
}
