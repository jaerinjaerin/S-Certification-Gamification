// import { ColumnDef } from '@tanstack/react-table';

import { SetQuizClient } from './_components/set-quiz-client';

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

// const nonSUserColumns: ColumnDef<nonSUser>[] = [
//   {
//     accessorKey: 'status',
//     header: 'Status',
//   },
//   {
//     accessorKey: 'subsidiary',
//     header: 'Subsidiary',
//   },
//   {
//     accessorKey: 'domain',
//     header: 'Domain',
//   },
//   {
//     accessorKey: 'channelName',
//     header: 'URL',
//   },
//   {
//     accessorKey: 'channelSegment',
//     header: 'Channel Segment',
//   },
//   {
//     accessorKey: 'jobGroup',
//     header: 'Job Group',
//   },
// ];

export default function SetQuizPage() {
  return <SetQuizClient />;
}
