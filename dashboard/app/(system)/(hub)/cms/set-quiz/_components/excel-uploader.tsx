import { ERROR_CODES } from '@/app/constants/error-codes';
import { processExcelBuffer } from '@/lib/quiz-excel-parser';
import { ProcessResult } from '@/lib/quiz-excel-parser';
import { useState } from 'react';

export const ExcelUploader = () => {
  const [data, setData] = useState<ProcessResult | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = (event: any) => {
    const file = event.target.files[0]; // 선택한 파일 가져오기
    if (!file) return;

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = (e: any) => {
      const bufferArray = e.target.result;
      const result: ProcessResult = processExcelBuffer(bufferArray, file.name);
      console.log(result);

      setData(result);
      setFile(file);
    };

    reader.onerror = () => {
      alert('파일을 읽는 중 오류가 발생했습니다.');
    };
  };

  const handleUpload = async () => {
    console.log('엑셀 파일 업로드');
    if (!data?.data || !file) {
      alert('업로드할 데이터가 없습니다.');
      return;
    }

    try {
      const { domainCode, languageCode, jobGroup, questions } = data.data;
      if (!domainCode || !languageCode || !jobGroup) {
        alert('파일명을 확인해주세요.');
        return;
      }

      if (questions.length === 0) {
        alert('질문 데이터가 없습니다.');
        return;
      }

      const formData = new FormData();
      formData.append('file', file); // 📂 파일 추가
      formData.append(
        'jsonData',
        JSON.stringify({
          campaignId: 'c903fec8-56f8-42fe-aa06-464148d4e0a5',
          domainCode,
          languageCode,
          jobGroup,
          questions,
        })
      );

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cms/quizset`,
        {
          method: 'POST',
          // headers: {
          //   'Content-Type': 'application/json',
          // },
          body: formData,
        }
      );

      if (response.ok) {
        alert('엑셀 파일 업로드가 완료되었습니다.');
        return;
      }

      const result = await response.json();
      console.error(result);

      if (result.errorCode === ERROR_CODES.HQ_QUESTIONS_NOT_REGISTERED) {
        alert('HQ 퀴즈 질문이 등록되지 않았습니다.');
      } else if (result.errorCode === ERROR_CODES.FILE_NAME_MISMATCH) {
        alert('최신 버전의 파일을 다운받아 수정하여 업로드해주세요.');
      } else {
        // ..... result.errorCode === ERROR_CODES 참조하여 기타 오류 처리
        if (result.errorCode) {
          alert(result.errorCode);
        } else {
          alert('알 수 없는 오류가 발생했습니다.');
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">엑셀 파일 업로드 & 분석</h2>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        className="mb-4"
      />
      <button disabled={!data} className="mt-4" onClick={() => handleUpload()}>
        엑셀 파일 업로드
      </button>
      {data && (
        <div className="border p-2 bg-gray-100 mt-2">
          <h3 className="font-semibold">📊 분석 결과 (JSON)</h3>
          <pre className="text-sm bg-white p-2 rounded overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
