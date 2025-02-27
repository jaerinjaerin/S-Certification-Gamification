import { ColumnDef } from '@tanstack/react-table';
import { ExternalLink, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusCircle } from '../../data-table-widgets';

// TODO: 타입 변경
export const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'status',
    header: () => <div>Status</div>,
    cell: ({ row }) => (
      <div>
        {/* TODO: status 값 확인 필요 */}
        <StatusCircle label="Ready" />
      </div>
    ),
  },
  {
    accessorKey: 'subsidiary',
    header: 'Subsidiary',
    cell: ({ row }) => <div className="uppercase">Subsidiary</div>,
  },
  {
    accessorKey: 'domain',
    header: 'Domain',
    cell: ({ row }) => <div>Domain</div>,
  },
  {
    accessorKey: 'channel',
    header: 'Channel Name',
    cell: ({ row }) => <div>Channel Name</div>,
  },
  {
    accessorKey: 'channelSegment',
    header: 'Channel Segment',
    cell: () => <div>Channel Segment</div>,
  },
  {
    accessorKey: 'jobGroup',
    header: 'Jop Group',
    cell: () => <div>Job Group</div>,
  },
];
