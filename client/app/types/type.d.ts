import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

type CampaignDomainQuizSetEx = CampaignDomainQuizSet & {
  language: Language;
  campaign: Campaign;
  domain: Domain;
  quizStages: QuizStageEx[];
};

type QuizStageEx = QuizStage & {
  questions: Questions[];
};

type QuestionEx = QuestionEx & {
  options: QuestionOption[];
};

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
