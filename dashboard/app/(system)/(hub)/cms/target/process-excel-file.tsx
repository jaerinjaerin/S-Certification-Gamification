import { Dispatch, SetStateAction } from 'react';
import { FileWithExtraInfo } from '../_types/type';
import { convertExcelToJson } from './convert-excel';

// ! 파일객체와 관련된 함수

export const processExcelFile = async (
  file: File,
  setIsConverting: Dispatch<SetStateAction<boolean>>
): Promise<FileWithExtraInfo> => {
  const originalFile = {
    ...file,
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
  };

  setIsConverting(true);

  try {
    const result = await convertExcelToJson(file);

    if (!result.success) {
      return {
        ...originalFile,
        hasError: true,
        errorMessage: result.errorMessage,
      };
    }

    return { ...originalFile, transformedData: result.data };
  } catch (error) {
    return {
      ...originalFile,
      hasError: true,
      errorMessage:
        error instanceof Error
          ? error.message
          : '파일 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
    };
  } finally {
    setIsConverting(false);
  }
};

// hasErro가 true인 파일들만 고르는 함수
export const getErrorFiles = (files: FileWithExtraInfo[]) => {
  return files.filter((file) => file.hasError);
};
// 정상적으로 업로드할수있는 파일들만 고르는 함수
export const getValidFiles = (files: FileWithExtraInfo[]) => {
  return files.filter((file) => !file.hasError);
};

export const clearFiles = (
  setFiles: Dispatch<SetStateAction<FileWithExtraInfo[]>>
) => {
  setFiles([]);
};
