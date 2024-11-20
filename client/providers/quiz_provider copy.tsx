"use client";

import { Campaign, CampaignDomainQuizSet, Language } from "@prisma/client";
import { createContext, useContext, useState } from "react";

interface QuizContextType {
  campaignDomainQuizSet: CampaignDomainQuizSet | null;
  campaign: Campaign | null;
  language: Language | null;
  // loading: boolean;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider = ({
  children,
  _quizSet,
  _campaign,
  _language,
}: {
  children: React.ReactNode;
  _quizSet: CampaignDomainQuizSet;
  _campaign: Campaign;
  _language: Language;
}) => {
  const [campaignDomainQuizSet, CampaignDomainQuizSet] =
    useState<CampaignDomainQuizSet | null>(_quizSet);
  const [campaign] = useState<Campaign | null>(_campaign);
  const [language] = useState<Language | null>(_language);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const searchParams = useSearchParams();
  //   const quizsetId = searchParams.get("quizset_id");

  //   const fetchData = async () => {
  //     try {
  //       setLoading(true);
  //       const response = await fetch(`/api/campaign/quiz_set/${quizsetId}`);
  //       if (!response.ok) {
  //         throw new Error("Failed to fetch data");
  //       }
  //       const data = await response.json();
  //       CampaignDomainQuizSet(data.item);
  //       Campaign(data.item.campaign);
  //       Language(data.item.language);
  //     } catch (error) {
  //       console.error(error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, []);

  return (
    <QuizContext.Provider
      value={{
        campaignDomainQuizSet,
        campaign,
        language,
        // loading,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error("useQuiz는 QuizProvider 내에서만 사용할 수 있습니다.");
  }
  return context;
};

// export function QuizProviderWrapper({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const { loading } = useQuiz();

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return <>{children}</>;
// }
