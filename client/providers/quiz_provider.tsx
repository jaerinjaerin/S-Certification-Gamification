'use client';

import { QuizCampaign, QuizMetadata } from '@/app/types/api';
import { useSearchParams } from 'next/navigation';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

interface QuizContextType {
  quizCampaign: QuizCampaign | null;
  quizMetadata: QuizMetadata | null;
  loading: boolean;
  error: string | null;
  serviceEntity: string | null;
  country: string | null;
  language: string | null;
  fetchQuizData: () => Promise<void>;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const [quizCampaign, setQuizCampaign] = useState<QuizCampaign | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // serviceEntity, country, language를 별도의 상태로 관리
  const [serviceEntity, setServiceEntity] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [language, setLanguage] = useState<string | null>(null);

  const searchParams = useSearchParams();

  const fetchQuizData = useCallback(async () => {
    const campaignId = searchParams.get('campaignId'); // 쿼리 파라미터에서 campaignId 가져오기

    if (!campaignId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/quiz_campaign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ campaignId }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quiz campaign data');
      }

      const data = await response.json();

      // QuizCampaign 데이터 설정
      setQuizCampaign(data);

      // 추가 데이터인 serviceEntity, country, language를 별도로 설정
      setServiceEntity(data.serviceEntity);
      setCountry(data.country);
      setLanguage(data.language);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchQuizData();
  }, [fetchQuizData]);

  return (
    <QuizContext.Provider
      value={{
        quizCampaign,
        loading,
        error,
        serviceEntity,
        country,
        language,
        fetchQuizData,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz는 QuizProvider 내에서만 사용할 수 있습니다.');
  }
  return context;
};
