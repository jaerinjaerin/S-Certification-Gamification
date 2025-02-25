import { ERROR_CODES } from '@/app/constants/error-codes';
import { Dispatch, SetStateAction } from 'react';
import { mutate } from 'swr';

type QuizSetError = {
  result: {
    errorCode: string;
    message: string;
  };
};

export const submitQuizSet = async (
  files: File[],
  campaignId: string,
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>
) => {
  try {
    // 모든 파일 업로드를 병렬로 처리
    const uploadPromises = files.map(async (file: File) => {
      const formData = new FormData();
      formData.append('file', file); // 📂  파일 추가
      formData.append('campaignId', campaignId);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cms/quizset`,
        {
          method: 'POST',
          body: formData,
        }
      );

      console.log('🥑 response', response);
      if (!response.ok) {
        const result = await response.json();
        console.error(result);
        throw new Error(result.errorCode);
      }
    });

    try {
      await Promise.all(uploadPromises);
      mutate(campaignId);
      alert('엑셀 파일 업로드가 완료되었습니다.');
    } catch (error: unknown) {
      const err = error as QuizSetError;
      if (err.result?.errorCode === ERROR_CODES.HQ_QUESTIONS_NOT_REGISTERED) {
        alert('HQ 퀴즈 질문이 등록되지 않았습니다.');
      } else if (err.result?.errorCode === ERROR_CODES.FILE_NAME_MISMATCH) {
        alert('최신 버전의 파일을 다운받아 수정하여 업로드해주세요.');
      } else {
        if (err.result?.errorCode) {
          alert(err.result.errorCode);
        } else {
          alert('알 수 없는 오류가 발생했습니다.');
        }
      }
    }
  } catch (error) {
    console.error('퀴즈 세트 업로드 중 오류가 발생했습니다:', error);
    alert('퀴즈 세트 업로드에 실패했습니다. 관리자에게 문의해주세요.');
  } finally {
    setIsDialogOpen(false);
  }
};
