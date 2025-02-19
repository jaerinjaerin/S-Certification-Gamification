import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from './data-table';
import { sleep } from '@/utils/utils';
import { DownloadFileListPopoverButton } from '../_components/custom-popover';
import { Button } from '@/components/ui/button';

// 테이블데이터 예시
export type Payment = {
  id: string;
  domain: string;
  ff_target: number;
  ff_ses_target: number;
  fsm_target: number;
  fsm_ses_target: number;
};

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'domain',
    header: 'Domain',
  },
  {
    accessorKey: 'ff_target',
    header: 'FF Target',
  },
  {
    accessorKey: 'ff_ses_target',
    header: 'FF(SES) Target',
  },
  {
    accessorKey: 'fsm_target',
    header: 'FSM Target',
  },
  {
    accessorKey: 'fsm_ses_target',
    header: 'FSM(SES) Target',
  },
];

async function getData(): Promise<Payment[]> {
  await sleep(3000);

  return [
    {
      id: '728ed52f',
      domain: 'Korea',
      ff_target: 100,
      ff_ses_target: 80,
      fsm_target: 90,
      fsm_ses_target: 70,
    },
    {
      id: '928ed53f',
      domain: 'Japan',
      ff_target: 95,
      ff_ses_target: 75,
      fsm_target: 85,
      fsm_ses_target: 65,
    },
    {
      id: '528ed54f',
      domain: 'China',
      ff_target: 90,
      ff_ses_target: 70,
      fsm_target: 80,
      fsm_ses_target: 60,
    },
    {
      id: '328ed55f',
      domain: 'Taiwan',
      ff_target: 85,
      ff_ses_target: 65,
      fsm_target: 75,
      fsm_ses_target: 55,
    },
    {
      id: '128ed56f',
      domain: 'Singapore',
      ff_target: 80,
      ff_ses_target: 60,
      fsm_target: 70,
      fsm_ses_target: 50,
    },
  ];
}

export default async function SetQuizPage() {
  const data = await getData();
  return (
    <div className="flex flex-col">
      <div className="absolute top-0 right-0 ">
        <DownloadFileListPopoverButton type="template" />
      </div>
      <div className="flex items-center justify-between">
        <span>Set Target</span>
        <div>
          <DownloadFileListPopoverButton type="data" />
          <Button variant="action">Upload</Button>
        </div>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
