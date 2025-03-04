import { DomainChannel } from '@/types/apiTypes';
import { ColumnDef } from '@tanstack/react-table';
import { CircleHelp, ExternalLink, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusCircle } from '../../data-table-widgets';
import { TooltipComponent } from '@/app/(system)/campaign/_components/tooltip-component';

// TODO: 타입 변경
export const columns: ColumnDef<DomainChannel>[] = [
  {
    accessorKey: 'status',
    header: () => (
      <div className="flex gap-1 items-center">
        <span>Status</span>
        <TooltipComponent
          side="right"
          trigger={
            <CircleHelp className="size-3 text-secondary cursor-pointer" />
          }
          description={
            <p>
              <span className="font-bold">Not Ready:</span> The quiz cannot be
              started because not all data has been uploaded yet. <br />
              <span className="font-bold">Ready:</span> All data has been
              uploaded, and the quiz can now be started. In this case, the quiz
              URL will be generated.
            </p>
          }
        />
      </div>
    ),
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
        {row.original.channels.map((channel, index) => (
          <div key={index}>{channel.name}</div>
        ))}
      </div>
    ),
  },
  {
    accessorKey: 'channelSegment',
    header: 'Channel Segment',
    cell: ({ row }) => (
      <div>
        {row.original.channels.map((channel, index) => (
          <div key={index}>{channel.channelSegment}</div>
        ))}
      </div>
    ),
  },
  {
    accessorKey: 'jobGroup',
    header: 'Jop Group',
    cell: ({ row }) => (
      <div>
        {row.original.channels.map((channel, index) => (
          <div key={index}>{channel.job.group}</div>
        ))}
      </div>
    ),
  },
];
