'use client';

import { DownloadFileListPopoverButton } from '../../_components/custom-popover';

import useQuizSetState from '../_store/quizset-state';

import NonSplusDataTable from './data-table/non-s-plus/data-table';
import SplusDataTable from './data-table/s-plus/data-table';
import {
  NonSPlusUserUploadButton,
  SPlusUserUploadButton,
} from './s-user-upload-button';
import { UserTabList } from './user-tab-list';

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
      <div>{tabState === 's' && <SplusDataTable />}</div>
      <div>{tabState === 'non-s' && <NonSplusDataTable />}</div>
    </div>
  );
}
