/* eslint-disable @typescript-eslint/no-explicit-any */
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

type LanguageConvertedProps = {
  file: File;
  json?: File;
  metadata: Record<string, any>;
};
