import { ERROR_CODES } from '@/app/constants/error-codes';

type NonSError = {
  result: {
    errorCode: string;
    message: string;
  };
};

export const submitNonS = async (files: File[]) => {
  try {
    for (const file of files) {
      if (!file) {
        alert('업로드할 데이터가 없습니다.');
        return;
      }
    }

    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('campaignId', 'c903fec8-56f8-42fe-aa06-464148d4e0a5'); // 📂 파일 추가

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cms/non-s`, // TODO: API 경로 확인 필요
        {
          method: 'POST',
          body: formData,
        }
      );

      if (response.ok) {
        alert('엑셀 파일 업로드가 완료되었습니다.');
        return;
      } else {
        const result = await response.json();
        console.error(result);
      }
    });

    try {
      await Promise.all(uploadPromises);
      alert('엑셀 파일 업로드가 완료되었습니다.');
    } catch (error) {
      const err = error as NonSError;
      if (err.result?.errorCode === ERROR_CODES.HQ_QUESTIONS_NOT_REGISTERED) {
        alert('HQ 퀴즈 질문이 등록되지 않았습니다.');
      } else if (err.result?.errorCode === ERROR_CODES.FILE_NAME_MISMATCH) {
        alert('최신 버전의 파일을 다운받아 수정하여 업로드해주세요.');
      }
    }
  } catch (error) {
    console.error('Activity ID 업로드 중 오류가 발생했습니다:', error);
    alert('Activity ID 업로드에 실패했습니다. 관리자에게 문의해주세요.');
  }
};
