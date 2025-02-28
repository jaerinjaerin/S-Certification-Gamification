'use client';

import { useStateVariables } from '@/components/provider/state-provider';
import { DownloadFileListPopoverButton } from '../../_components/custom-popover';

import useQuizSetState from '../_store/quizset-state';

import NonSplusDataTable from './data-table/non-s-plus/data-table';
import SplusDataTable from './data-table/s-plus/data-table';
import {
  HQUploadButton,
  NonSPlusUserUploadButton,
  SPlusUserUploadButton,
} from './s-user-upload-button';
import { UserTabList } from './user-tab-list';
import useSWR from 'swr';
import { QuizSetResponse } from '../_type/type';
import { fetcher } from '../../lib/fetcher';
import { LoaderWithBackground } from '@/components/loader';
import { isEmpty } from '../../_utils/utils';

export function SetQuizClient() {
  const {
    ui: { tabState },
    setTabState,
  } = useQuizSetState();

  const { campaign } = useStateVariables();

  // 데이터가 없으면 데이터테이블 비활성화 - HQ 업로드 버튼만 (quizset={campaign?.id} 데이터는 여기서 패칭)
  const QUIZSET_DATA_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/cms/quizset?campaignId=${campaign?.id}`;
  const { data, isLoading } = useSWR<QuizSetResponse>(
    QUIZSET_DATA_URL,
    fetcher
  );

  if (isLoading) {
    return <LoaderWithBackground />;
  }

  if (
    !isLoading &&
    data?.result?.groupedQuizSets &&
    isEmpty(data.result.groupedQuizSets)
  ) {
    return <HQUploadButton />;
  }

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
      <div>{tabState === 's' && data && <SplusDataTable data={data} />}</div>
      <div>{tabState === 'non-s' && <NonSplusDataTable />}</div>
    </div>
  );
}
