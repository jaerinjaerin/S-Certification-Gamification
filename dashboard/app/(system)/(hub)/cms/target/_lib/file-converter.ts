/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dispatch, SetStateAction } from 'react';
import { convertTarget } from '../../_utils/convert-excel-json';

export const processAndExportExcelAndJsonObject = async (
  file: File,
  setIsConverting: Dispatch<SetStateAction<boolean>>
): Promise<TargetConvertedProps> => {
  try {
    setIsConverting(true);
    const result = await convertTarget(file);

    if (!result.success) {
      return {
        file,
        metadata: { hasError: true, errorMessage: result.errorMessage },
      };
    }

    return { file, json: result.data, metadata: { hasError: false } };
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
