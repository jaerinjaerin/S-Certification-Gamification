"use client";

import { Campaign, Country, CountryLanguage } from "@prisma/client";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";

interface QuizContextType {
  campaign: Campaign | null;
  country: Country | null;
  languages: CountryLanguage[] | null;
  selectedLanguage: CountryLanguage | null;
  setCampaign: Dispatch<SetStateAction<Campaign | null>>;
  setCountry: Dispatch<SetStateAction<Country | null>>;
  setLanguages: Dispatch<SetStateAction<CountryLanguage[] | null>>;
  setSelectedLanguage: Dispatch<SetStateAction<CountryLanguage | null>>;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider = ({ children }: { children: React.ReactNode }) => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [country, setCountry] = useState<Country | null>(null);
  const [languages, setLanguages] = useState<CountryLanguage[] | null>(null);
  const [selectedLanguage, setSelectedLanguage] =
    useState<CountryLanguage | null>(null);

  return (
    <QuizContext.Provider
      value={{
        campaign,
        country,
        languages,
        selectedLanguage,
        setCampaign,
        setCountry,
        setLanguages,
        setSelectedLanguage,
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
