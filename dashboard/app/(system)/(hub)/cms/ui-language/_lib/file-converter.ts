/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dispatch, SetStateAction } from 'react';
import { jsonToFile } from '@/lib/file';
import { convertUi } from '../../_utils/convert-excel-json';

export const processAndExportExcelAndJson = async (
  file: File,
  setIsConverting: Dispatch<SetStateAction<boolean>>
): Promise<LanguageConvertedProps> => {
  setIsConverting(true);

  try {
    const result = await convertUi(file);

    if (!result.success) {
      return {
        file,
        metadata: { hasError: true, errorMessage: result.errorMessage },
      };
    }

    const lastDotIndex = file.name.lastIndexOf('.');
    const filename = `${lastDotIndex !== -1 ? file.name.slice(0, lastDotIndex) : file.name}.json`;
    const json = jsonToFile({ filename, json: result.data });

    return { file, json, metadata: { hasError: false } };
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
