'use client';
import { Button } from '@/components/ui/button';
import { DownloadFileListPopoverButton } from '../../(hub)/cms/_components/custom-popover';
import { useStateVariables } from '@/components/provider/state-provider';
import { useRouter } from 'next/navigation';
import { useNavigation } from '../../(hub)/cms/_hooks/useNavaigation';
import { CustomAlertDialog } from '../../(hub)/cms/_components/custom-alert-dialog';
import dayjs from 'dayjs';
import { Pen, Trash2 } from 'lucide-react';

export default function CertificationClientComponent() {
  const { role, campaigns } = useStateVariables(); //role이 null이면 admin
  const { routeToPage } = useNavigation();
  console.log('🥕 role', role, campaigns);

  if (campaigns?.length === 0) {
    return (
      <div className="text-size-24px font-bold h-full flex items-center justify-center whitespace-pre-line text-center">
        {
          'You have no ongoing campaigns.\n로그인 했지만 인증제에 참여하지 않는 도메인 권한자에게 보여지는 메시지 필요.'
        }
      </div>
    );
  }

  return (
    <div>
      <div
        style={{ width: 'calc(100vw - 48px)' }}
        className="flex justify-between items-center"
      >
        <h2 className="text-size-17px font-semibold">Certification List</h2>
        {!role && (
          <div className="flex gap-3">
            <DownloadFileListPopoverButton type="template" />
            <Button
              variant="action"
              onClick={() => routeToPage('/campaign/create')}
            >
              Create Certification
            </Button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-x-[1.125rem] gap-y-6 mt-8">
        {campaigns &&
          campaigns.map((campaign) => (
            <CertificationListItem key={campaign.id} campaign={campaign} />
          ))}
      </div>
    </div>
  );
}

function CertificationListItem({ campaign }: { campaign: Campaign }) {
  const { setCampaign } = useStateVariables();
  const router = useRouter();

  return (
    <div
      className="flex gap-2 items-center border border-zinc-200 rounded-lg justify-between p-6 shadow-sm"
      onClick={() => {
        setCampaign(campaign);
        router.push(`/dashboard/overview`);
      }}
    >
      <div className="px-3 grow min-w-0">
        <h3 className="text-size-24px font-semibold break-words">
          {campaign.name}
        </h3>
        <time className="text-zinc-500 text-size-14px">
          {`${dayjs(campaign.startedAt).format('YYYY.MM.DD')} ~ 
          ${dayjs(campaign.endedAt).format('YYYY.MM.DD')}`}
        </time>
      </div>
      <div className="flex gap-3">
        <CustomAlertDialog
          trigger={
            <Button
              variant="ghost"
              className="p-0 aspect-square size-[1.875rem] rounded-sm bg-zinc-50"
            >
              <Trash2
                style={{ width: '1.25rem', height: '1.25rem' }}
                className="text-red-500"
              />
            </Button>
          }
          description="Once deleted, the registered data cannot be restored. Are you sure you want to delete?"
          buttons={[
            { label: 'Cancel', variant: 'secondary', type: 'cancel' },
            { label: 'Delete', variant: 'delete', type: 'delete' },
          ]}
        />

        <Button variant="ghost">
          <Pen />
        </Button>
      </div>
    </div>
  );
}
