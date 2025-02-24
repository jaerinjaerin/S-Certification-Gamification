'use client';

// import useSWR from 'swr';
// import { fetcher } from '../../lib/fetcher';

import { DownloadFileListPopoverButton } from '../../_components/custom-popover';
import { UserTabList } from './user-tab-list';
import {
  NonSPlusUserUploadButton,
  SPlusUserUploadButton,
} from './s-user-upload-button';
import useQuizSetState from '../store/quizset-state';
// import { DataTable } from './data-table';
// import { sUserColumns } from '../columns';

export function SetQuizClient() {
  const {
    ui: { tabState },
    setTabState,
  } = useQuizSetState();

  return (
    <div className="flex flex-col">
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
      {/* <div>{tabState === 's' && <SUserTable />}</div> */}
      {/* <div>{tabState === 'non-s' && <NonSUserTable />}</div> */}
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
