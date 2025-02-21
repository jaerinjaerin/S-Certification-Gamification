/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dispatch, SetStateAction } from 'react';
import { FileWithExtraInfo, UploadExcelFileVariant } from '../_types/type';
import { convertUi, convertQuizSet, convertTarget } from './convert-excel-json';

const convertExcelToJsonByVariant = {
  quiz: convertQuizSet,
  ui: convertUi,
  target: convertTarget,
} as Record<string, (file: File) => Promise<any>>;

export const processExcelFile = async (
  file: File,
  setIsConverting: Dispatch<SetStateAction<boolean>>,
  variant: UploadExcelFileVariant
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
    const convert = convertExcelToJsonByVariant[variant];
    const result = await convert(file);

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

// file과 json 분리
export const processExcelFileDivided = async (
  file: File,
  setIsConverting: Dispatch<SetStateAction<boolean>>,
  variant: UploadExcelFileVariant
): Promise<{ file: File; json?: File; metadata: JsonObject }> => {
  setIsConverting(true);

  try {
    const convert = convertExcelToJsonByVariant[variant];
    const result = await convert(file);

    if (!result.success) {
      return {
        file,
        metadata: { hasError: true, errorMessage: result.errorMessage },
      };
    }

    const lastDotIndex = file.name.lastIndexOf('.');
    const filename = `${lastDotIndex !== -1 ? file.name.slice(0, lastDotIndex) : file.name}.json`;
    const jsonString = JSON.stringify(result.data, null, 2);
    const jsonFile = new File([jsonString], filename, {
      type: 'application/json',
    });

    return { file, json: jsonFile, metadata: { hasError: false } };
  } catch (error) {
    return {
      file,
      metadata: {
        hasError: true,
        errorMessage:
          error instanceof Error
            ? error.message
            : '파일 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
      },
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
