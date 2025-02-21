type LanguageProps = {
  id: string;
  code: string;
  name: string;
  jsonUrl?: string;
  excelUrl?: string;
};

type LanguageDataProps = {
  languages: LanguageProps[] | null;
};
