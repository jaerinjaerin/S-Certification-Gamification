'use client';

import { DomainData } from '@/lib/nomember-excel-parser';
import { useState } from 'react';
import { DownloadFileListPopoverButton } from '../../_components/custom-popover';
import useQuizSetState from '../store/quizset-state';
import {
  NonSPlusUserUploadButton,
  SPlusUserUploadButton,
} from './s-user-upload-button';
import { UserTabList } from './user-tab-list';
import { useStateVariables } from '@/components/provider/state-provider';
import { fetcher } from '../../lib/fetcher';
import useSWR from 'swr';
import { LoaderWithBackground } from '@/components/loader';
import { QuizSet } from '../_type/type';

// import { DataTable } from './data-table';
// import { sUserColumns } from '../columns';

export function SetQuizClient() {
  const {
    ui: { tabState },
    setTabState,
  } = useQuizSetState();

  return (
    <div className="flex flex-col">
      <NoMemberDomainExcelUploader />
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

// function SUserTable() {
//   // 캠페인의 전체 데이터 가져오기
//   const QUIZSET_DATA_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/cms/quizset?campaignId=c903fec8-56f8-42fe-aa06-464148d4e0a5`;
//   const { data, isLoading } = useSWR(QUIZSET_DATA_URL, fetcher);
//   console.log('🥕 data', data);

//   return (
//     <>
//       {JSON.stringify(data)}
//       <DataTable data={[]} columns={sUserColumns} />
//     </>
//   );
// }

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
        `${process.env.NEXT_PUBLIC_API_URL}/api/cms/no_member_country`,
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
        Activity 엑셀 파일 업로드
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
