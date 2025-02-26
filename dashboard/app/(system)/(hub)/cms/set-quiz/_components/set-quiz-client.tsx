'use client';

import { LoaderWithBackground } from '@/components/loader';
import { useStateVariables } from '@/components/provider/state-provider';
import { DomainData } from '@/lib/nomember-excel-parser';
import { QuizStageEx } from '@/types';
import { useState } from 'react';
import useSWR from 'swr';
import { DownloadFileListPopoverButton } from '../../_components/custom-popover';
import { fetcher } from '../../lib/fetcher';
import { QuizSet } from '../_type/type';
import useQuizSetState from '../store/quizset-state';
import {
  NonSPlusUserUploadButton,
  SPlusUserUploadButton,
} from './s-user-upload-button';
import { UserTabList } from './user-tab-list';

// import { DataTable } from './data-table';

export function SetQuizClient() {
  const {
    ui: { tabState },
    setTabState,
  } = useQuizSetState();

  return (
    <div className="flex flex-col">
      <NoMemberDomainExcelUploader />
      <DownloadZipButton />
      <div className="absolute top-0 right-0 ">
        <DownloadFileListPopoverButton type="template" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span>Domain List</span>
          <UserTabList setTabState={setTabState} />
        </div>
        {tabState === 's' && <SPlusUserUploadButton />}
        {tabState === 'non-s' && <NonSPlusUserUploadButton />}
      </div>
      <div>{tabState === 's' && <SUserTable />}</div>
      {/* <div>{tabState === 'non-s' && <NonSUserTable />}</div> */}
    </div>
  );
}

function SUserTable() {
  const { campaign } = useStateVariables();
  const QUIZSET_DATA_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/cms/quizset?campaignId=${campaign?.id}`;
  const { data, isLoading } = useSWR<QuizSet>(QUIZSET_DATA_URL, fetcher);
  console.log('🥕 data', data);

  if (isLoading) {
    return <LoaderWithBackground />;
  }
  return (
    <div>
      {data?.result.groupedQuizSets.map((quizSet) => {
        return (
          <div key={quizSet.quizSet.id}>{quizSet.quizSet.domain.code}</div>
        );
      })}
    </div>
  );
}

function SUserTableTest() {
  // 캠페인의 전체 데이터 가져오기
  const QUIZSET_DATA_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/cms/quizset?campaignId=c903fec8-56f8-42fe-aa06-464148d4e0a5`;
  const { data, isLoading } = useSWR(QUIZSET_DATA_URL, fetcher);
  console.log('🥕 data', data);

  return (
    <div className="mt-4">
      <>Test Table</>
      {data &&
        data.success &&
        data.result.groupedQuizSets &&
        data.result.groupedQuizSets.length > 0 &&
        // <DataTable data={data.quizSets} columns={sUserColumns} />
        data.result.groupedQuizSets.map((groupedQuizSet: any) => {
          return (
            <div key={groupedQuizSet.quizSet.id}>
              <p>
                {groupedQuizSet.quizSet.domain.name}:{' '}
                {groupedQuizSet.quizSet.language.code}, stages:{' '}
                {groupedQuizSet.quizSet.quizStages.length}
                {groupedQuizSet.quizSet.quizStages.length > 0 && (
                  <div>
                    {groupedQuizSet.quizSet.quizStages.map(
                      (quizStage: QuizStageEx) => {
                        return (
                          <div key={quizStage.id}>
                            <p>
                              stage {quizStage.name}:{' '}
                              {quizStage.questions.length}
                            </p>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </p>
              {/* <DataTable data={quizSet.data} columns={sUserColumns} /> */}
            </div>
          );
        })}
    </div>
  );
}

const NoMemberDomainExcelUploader = () => {
  const [data, setData] = useState<DomainData[] | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = (event: any) => {
    const file = event.target.files[0]; // 선택한 파일 가져오기
    if (!file) return;

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = (e: any) => {
      // const bufferArray = e.target.result;
      // const result: ProcessResult = parseExcelBufferToDomainJson(bufferArray);
      // console.log(result);

      // if (result.result?.domainDatas) {
      //   setData(result.result?.domainDatas);
      // }
      setFile(file);
    };

    reader.onerror = () => {
      alert('파일을 읽는 중 오류가 발생했습니다.');
    };
  };

  const handleUpload = async () => {
    console.log('엑셀 파일 업로드');
    if (!file) {
      alert('업로드할 데이터가 없습니다.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file); // 📂 파일 추가
      formData.append('campaignId', 'c903fec8-56f8-42fe-aa06-464148d4e0a5'); // 📂 파일 추가

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cms/no_service_channel`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (response.ok) {
        alert('엑셀 파일 업로드가 완료되었습니다.');
      }

      const result = await response.json();
      console.log(result);
      setData(result.result?.data);
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
      <button disabled={!file} className="mt-4" onClick={() => handleUpload()}>
        미사용국가 엑셀 파일 업로드
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

export default function DownloadZipButton() {
  const handleDownload = async () => {
    try {
      // 예시: S3 파일 키 목록을 쉼표로 구분하여 전달합니다.
      // const files = 'file1.jpg,file2.pdf';
      const response = await fetch(`/api/cms/resource/download/quizset`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // 응답을 Blob으로 변환
      const blob = await response.blob();

      // Blob URL 생성
      const url = window.URL.createObjectURL(blob);

      // 다운로드 링크 생성 및 클릭 이벤트 트리거
      const a = document.createElement('a');
      a.href = url;
      a.download = 'files.zip';
      document.body.appendChild(a);
      a.click();

      // 임시 링크 제거 및 URL 해제
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  return <button onClick={handleDownload}>Download ZIP</button>;
}
