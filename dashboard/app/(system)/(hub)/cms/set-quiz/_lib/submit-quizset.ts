import { ERROR_CODES } from '@/app/constants/error-codes';
import { ProcessResult } from '@/lib/quiz-excel-parser';
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
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>,
  setProcessResult: Dispatch<SetStateAction<ProcessResult[]>>,
  variant: 'hq' | 'quiz'
) => {
  try {
    const allResults = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('campaignId', campaignId);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/cms/quizset`,
          {
            method: 'POST',
            body: formData,
          }
        );

        const result = await response.json();
        allResults.push(result);

        // 각 파일 처리 결과를 즉시 누적
        setProcessResult((prev) => [...prev, result]);
      } catch (error) {
        console.error(`파일 "${file.name}" 업로드 중 오류 발생:`, error);
        const errorResult = {
          success: false,
          fileName: file.name,
          message: '파일 업로드 중 오류가 발생했습니다.',
        };
        allResults.push(errorResult);

        // 에러 결과도 즉시 누적
        setProcessResult((prev) => [...prev, errorResult]);
      }
    }

    if (variant !== 'hq') {
      try {
        mutate(
          (key) =>
            typeof key === 'string' &&
            (key.includes('quizset') || key.includes('activity'))
        );
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
  } finally {
    setIsDialogOpen(false);
  }
};

// 🟢 퀴즈 세트 업로드 (Promise.all)
// export const submitQuizSet = async (
//   files: File[],
//   campaignId: string,
//   setIsDialogOpen: Dispatch<SetStateAction<boolean>>
// ): Promise<ProcessResult[] | undefined> => {
//   try {
//     // 모든 파일 업로드를 병렬로 처리
//     const uploadPromises = files.map(async (file: File) => {
//       try {
//         const formData = new FormData();
//         formData.append('file', file); // 📂  파일 추가
//         formData.append('campaignId', campaignId);

//         const response = await fetch(
//           `${process.env.NEXT_PUBLIC_API_URL}/api/cms/quizset`,
//           {
//             method: 'POST',
//             body: formData,
//           }
//         );

//         return response.json();
//       } catch (error) {
//         console.error(`파일 "${file.name}" 업로드 중 오류 발생:`, error);
//         return {
//           error: true,
//           fileName: file.name,
//           message: '파일 업로드 중 오류가 발생했습니다.',
//         };
//       }
//     });

//     try {
//       const result = await Promise.all(uploadPromises);
//       // mutate(`quizset?campaignId=${campaignId}`);
//       mutate(
//         (key) =>
//           typeof key === 'string' &&
//           (key.includes('quizset') || key.includes('activity'))
//       );
//       return result;
//     } catch (error: unknown) {
//       const err = error as QuizSetError;
//       if (err.result?.errorCode === ERROR_CODES.HQ_QUESTIONS_NOT_REGISTERED) {
//         alert('HQ 퀴즈 질문이 등록되지 않았습니다.');
//       } else if (err.result?.errorCode === ERROR_CODES.FILE_NAME_MISMATCH) {
//         alert('최신 버전의 파일을 다운받아 수정하여 업로드해주세요.');
//       } else {
//         if (err.result?.errorCode) {
//           alert(err.result.errorCode);
//         } else {
//           alert('알 수 없는 오류가 발생했습니다.');
//         }
//       }
//     }
//   } catch (error) {
//     console.error('퀴즈 세트 업로드 중 오류가 발생했습니다:', error);
//     alert('퀴즈 세트 업로드에 실패했습니다. 관리자에게 문의해주세요.');
//   } finally {
//     setIsDialogOpen(false);
//   }
// };
