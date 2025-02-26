export type UploadExcelFileVariant = 'quiz' | 'activityId' | 'non-s';

export type UploadExcelFileModalProps = {
  children: React.ReactNode;
  title: string;
  variant: UploadExcelFileVariant;
};

// quizSet data type =============================================
export type QuizSet = {
  success: boolean;
  result: {
    groupedQuizSets: Array<{
      quizSet: {
        id: string;
        campaignId: string;
        domainId: string;
        languageId: string;
        jobCodes: string[];
        domain: {
          id: string;
          code: string;
          subsidiary: {
            id: string;
            region: {
              id: string;
              name: string;
            };
          };
        };
        language: {
          id: string;
          code: string;
        };
        quizStages: Array<{
          id: string;
          name: string;
          order: number;
          badgeImage: {
            id: string;
            url: string;
          } | null;
          questions: Array<{
            id: string;
            text: string;
            order: number;
            options: Array<{
              id: string;
              text: string;
              order: number;
              isCorrect: boolean;
            }>;
            backgroundImage: {
              id: string;
              url: string;
            } | null;
            characterImage: {
              id: string;
              url: string;
            } | null;
          }>;
        }>;
      };
      quizSetFile:
        | {
            id: string;
            quizSetId: string;
            path: string;
            jobCodes: string[];
          }
        | undefined;
    }>;
    activityBadges: Array<{
      id: string;
      badgeImage: {
        id: string;
        url: string;
      } | null;
    }>;
  };
};
