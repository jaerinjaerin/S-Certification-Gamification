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
