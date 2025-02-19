'use client';
import { Button } from '@/components/ui/button';
import { DownloadFileListPopoverButton } from '../_components/custom-popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from './data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UploadImageFileModal } from '../media-library/_components/upload-image-file-modal';

export type sUser = {
  id: string;
  status: 'completed' | 'In Progress';
  subsidiary: string;
  domain: string;
  url: string;
  quizSet: string;
  activityId: string;
  uiLanguage: string;
};

export type nonSUser = {
  status: 'completed' | 'In Progress';
  subsidiary: string;
  domain: string;
  url: string;
  channelName: string;
  channelSegment: string;
  jobGroup: string;
};
export const sUserColumns: ColumnDef<sUser>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'subsidiary',
    header: 'Subsidiary',
  },
  {
    accessorKey: 'domain',
    header: 'Domain',
  },
  {
    accessorKey: 'url',
    header: 'URL',
  },
  {
    accessorKey: 'quizSet',
    header: 'Quiz Set',
  },
  {
    accessorKey: 'activityId',
    header: 'Activity ID',
  },
  {
    accessorKey: 'uiLanguage',
    header: 'UI Language',
  },
];

export const nonSUserColumns: ColumnDef<nonSUser>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'subsidiary',
    header: 'Subsidiary',
  },
  {
    accessorKey: 'domain',
    header: 'Domain',
  },
  {
    accessorKey: 'channelName',
    header: 'URL',
  },
  {
    accessorKey: 'channelSegment',
    header: 'Channel Segment',
  },
  {
    accessorKey: 'jobGroup',
    header: 'Job Group',
  },
];
export default function SetQuizPage() {
  const [tabState, setTabState] = useState<'s' | 'non-s'>('s');

  return (
    <div className="flex flex-col">
      <div className="absolute top-0 right-0 ">
        <DownloadFileListPopoverButton type="template" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span>Domain List</span>
          <Tabs
            defaultValue="s"
            className="w-[400px]"
            onValueChange={(value) => {
              setTabState(value as 's' | 'non-s');
            }}
          >
            <TabsList>
              <TabsTrigger className="min-w-[148px]" value="s">
                S+ Users
              </TabsTrigger>
              <TabsTrigger className="min-w-[148px]" value="non-s">
                Non S+ Users
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* TODO: Need Tab component  */}
        {/* TODO: Tab의 상태에 따라 버튼 변경  */}

        <div className="flex gap-3">
          <DownloadFileListPopoverButton type="data" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="action">Upload</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <UploadImageFileModal type="add">
                  <Button>Quiz Set</Button>
                </UploadImageFileModal>
              </DropdownMenuItem>
              <DropdownMenuItem>Activity ID</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* TODO 데이터 테이블 추가 */}
      {/* TODO: 상태에 따라 테이블이 변경됨 */}

      <div className="my-8">
        {tabState === 's' ? 'S+ Users' : 'Non S+ Users'}
      </div>
      {tabState === 's' && <DataTable columns={sUserColumns} data={[]} />}
      {tabState === 'non-s' && (
        <DataTable columns={nonSUserColumns} data={[]} />
      )}
    </div>
  );
}
