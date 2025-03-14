import { extractFileInfo } from '@/lib/quiz-excel-parser';

interface ProcessResult {
  success: boolean;
  data?: {
    domainCode: string | null;
    languageCode: string | null;
    jobGroup: string | null;
  };
  errors?: { line: number; message: string }[];
}

export function handleQuizSetFileUpload(file: File): ProcessResult {
  const { domainCode, languageCode, jobGroup } = extractFileInfo(file.name);

  if (!domainCode || !languageCode || !jobGroup) {
    return {
      success: false,
      errors: [{ line: 0, message: 'Please check the file name format' }],
    };
  }

  return {
    success: true,
    data: {
      domainCode,
      languageCode,
      jobGroup,
    },
  };
}
