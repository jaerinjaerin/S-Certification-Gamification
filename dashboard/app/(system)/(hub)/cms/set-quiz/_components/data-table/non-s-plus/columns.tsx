import { DomainChannel } from '@/types/apiTypes';
import { ColumnDef } from '@tanstack/react-table';
import { StatusCircle } from '../../data-table-widgets';

// TODO: 타입 변경
export const columns: ColumnDef<DomainChannel>[] = [
  {
    accessorKey: 'status',
    header: () => <div>Status</div>,
    cell: ({ row }) => (
      <div>
        {/* TODO: status 값 확인 필요 */}
        {/* <StatusCircle label="Ready" /> */}
        {row.original.isReady ? (
          <StatusCircle label="Ready" />
        ) : (
          <StatusCircle label="Not Ready" />
        )}
      </div>
    ),
  },
  {
    accessorKey: 'subsidiary',
    header: 'Subsidiary',
    cell: ({ row }) => (
      <div className="uppercase">{row.original.subsidiary?.name}</div>
    ),
  },
  {
    accessorKey: 'domain',
    header: 'Domain',
    cell: ({ row }) => <div>{row.original.name}</div>,
  },
  {
    accessorKey: 'channel',
    header: 'Channel Name',
    cell: ({ row }) => (
      <div>
        {row.original.channels.map((channel) => (
          <div>{channel.name}</div>
        ))}
      </div>
    ),
  },
  {
    accessorKey: 'channelSegment',
    header: 'Channel Segment',
    cell: ({ row }) => (
      <div>
        {row.original.channels.map((channel) => (
          <div>{channel.channelSegment}</div>
        ))}
      </div>
    ),
  },
  {
    accessorKey: 'jobGroup',
    header: 'Jop Group',
    cell: ({ row }) => (
      <div>
        {row.original.channels.map((channel) => (
          <div>{channel.job.group}</div>
        ))}
      </div>
    ),
  },
];
