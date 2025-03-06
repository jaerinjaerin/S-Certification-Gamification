import { ERROR_CODES } from '@/app/constants/error-codes';
import { mutate } from 'swr';
type NonSError = {
  result: {
    errorCode: string;
    message: string;
  };
};

export const submitNonS = async (files: File[], campaignId: string) => {
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
      formData.append('campaignId', campaignId); // 📂 파일 추가

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cms/no_service_channel`,
        {
          method: 'POST',
          body: formData,
        }
      );

      return response.json();
    });

    try {
      const result = await Promise.all(uploadPromises);
      mutate(`/api/cms/no_service_channel?campaignId=${campaignId}`);
      return result;
    } catch (error) {
      const err = error as NonSError;
      if (err.result?.errorCode === ERROR_CODES.HQ_QUESTIONS_NOT_REGISTERED) {
        alert('HQ 퀴즈 질문이 등록되지 않았습니다.');
      } else if (err.result?.errorCode === ERROR_CODES.FILE_NAME_MISMATCH) {
        alert('최신 버전의 파일을 다운받아 수정하여 업로드해주세요.');
      }
    }
  } catch (error) {
    console.error('Non S+ User 파일 업로드 중 오류가 발생했습니다:', error);
    alert('Non S+ User 업로드에 실패했습니다. 관리자에게 문의해주세요.');
  }
};

//   const handleUpload = async () => {
//     console.log('엑셀 파일 업로드');
//     if (!file) {
//       alert('업로드할 데이터가 없습니다.');
//       return;
//     }

//     try {
//       const formData = new FormData();
//       formData.append('file', file); // 📂 파일 추가
//       formData.append('campaignId', 'c903fec8-56f8-42fe-aa06-464148d4e0a5'); // 📂 파일 추가

//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/api/cms/no_service_channel`,
//         {
//           method: 'POST',
//           body: formData,
//         }
//       );

//       if (response.ok) {
//         alert('엑셀 파일 업로드가 완료되었습니다.');
//       }

//       const result = await response.json();
//       console.log(result);
//       setData(result.result?.data);
//     } catch (error) {
//       console.error(error);
//     }
//   };
