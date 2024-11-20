"use client";

import { Campaign, CampaignDomainQuizSet, Language } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface QuizLoaderProps {
  // quizId: string;
  children: (
    quiz: CampaignDomainQuizSet,
    campaign: Campaign,
    language: Language
  ) => React.ReactNode;
}

export default function QuizLoader({ children }: QuizLoaderProps) {
  const searchParams = useSearchParams();
  const quizSetId = searchParams.get("quizset_id");

  const [quizSet, setQuizSet] = useState<CampaignDomainQuizSet | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [language, setLanguage] = useState<Language | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchQuizData = async () => {
      console.log("fetchQuizData", quizSetId);
      setLoading(true);
      try {
        const response = await fetch(`/api/campaign/quiz_set/${quizSetId}`);
        if (!response.ok) {
          if (response.status === 410) {
            router.push("/error/expired"); // 만료 페이지로 리다이렉트
            return;
          }
          if (response.status === 404) {
            router.push("/error/not-found"); // 퀴즈 없음 페이지로 리다이렉트
            return;
          }
          throw new Error("Unexpected error occurred.");
        }
        const data = await response.json();
        setQuizSet(data.item);
        setCampaign(data.item.campaign);
        setLanguage(data.item.language);
      } catch (err) {
        setError("Failed to load quiz data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quizSetId]);

  const routeNotFound = () => {
    // window.location.href = "/map";
    const currentUrl = new URL(window.location.href);
    const queryString = currentUrl.search; // 현재 URL의 query string 추출
    const targetUrl = `/error/not-found${queryString}`; // /quiz 뒤에 query string 추가
    window.location.href = targetUrl;
  };

  if (loading) {
    return <div>Loading...</div>; // 로딩 화면
  }

  if (error) {
    return <div>{error}</div>; // 에러 메시지
  }

  if (!quizSet || !campaign || !language) {
    routeNotFound();
    return;
  }

  return <>{children(quizSet, campaign, language)}</>; // 유효한 퀴즈 데이터를 자식 컴포넌트에 전달
}
