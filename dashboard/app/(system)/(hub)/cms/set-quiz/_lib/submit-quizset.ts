import { ERROR_CODES } from '@/app/constants/error-codes';
import { ProcessResult } from '@/lib/quiz-excel-parser';

type QuizSetError = {
  result: {
    errorCode: string;
    message: string;
  };
};

export const submitQuizSet = async (data: ProcessResult[], files: File[]) => {
  console.log('🥑 files', files, 'data', data);
  try {
    for (const item of data) {
      if (!item.data) {
        alert('파일 데이터가 없습니다.');
        return;
      }

      const { domainCode, languageCode, jobGroup, questions } = item.data;

      if (!domainCode || !languageCode || !jobGroup) {
        alert('파일명을 확인해주세요.');
        return;
      }

      if (questions.length === 0) {
        alert('질문 데이터가 없습니다.');
        return;
      }

      // 모든 파일 업로드를 병렬로 처리
      const uploadPromises = data.map(
        async (item: ProcessResult, index: number) => {
          const formData = new FormData();
          formData.append('file', files[index]); // 📂 해당 인덱스의 파일 추가
          formData.append(
            'jsonData',
            JSON.stringify({
              campagnId: 'c903fec8-56f8-42fe-aa06-464148d4e0a5',
              domainCode: item.data?.domainCode,
              languageCode: item.data?.languageCode,
              jobGroup: item.data?.jobGroup,
              questions: item.data?.questions,
            })
          );

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/cms/quizset`,
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
        }
      );

      try {
        await Promise.all(uploadPromises);
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
    }
  } catch (error) {
    console.error('퀴즈 세트 업로드 중 오류가 발생했습니다:', error);
    alert('퀴즈 세트 업로드에 실패했습니다. 관리자에게 문의해주세요.');
  }
};
