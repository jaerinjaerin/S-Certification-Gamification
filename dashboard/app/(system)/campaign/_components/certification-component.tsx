'use client';
import { Button } from '@/components/ui/button';
import { DownloadFileListPopoverButton } from '../../(hub)/cms/_components/custom-popover';
import { useStateVariables } from '@/components/provider/state-provider';
import { useNavigation } from '../../(hub)/cms/_hooks/useNavigation';
import { CustomAlertDialog } from '../../(hub)/cms/_components/custom-alert-dialog';
import dayjs from 'dayjs';
import { Pen, Trash2 } from 'lucide-react';
import { LoaderWithBackground } from '@/components/loader';
import { toast } from 'sonner';

export default function CertificationClientComponent() {
  const { role, campaigns, setCampaign } = useStateVariables(); //role이 null이면 ADMIN
  const { routeToPage, isRouting } = useNavigation();

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
    <div style={{ width: 'calc(100vw - 63px)' }}>
      <div className="flex justify-between items-center">
        <h2 className="text-size-17px font-semibold">Certification List</h2>
        {!role && (
          <div className="flex gap-3">
            <DownloadFileListPopoverButton type="template" />
            <Button
              variant="action"
              onClick={() => {
                routeToPage('/campaign/create');
              }}
            >
              Create Certification
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-x-[1.125rem] gap-y-6 mt-8">
        {campaigns &&
          campaigns
            .filter((campaign) => !campaign.deleted)
            .map((campaign) => (
              <CertificationListItem key={campaign.id} campaign={campaign} />
            ))}
      </div>
      {isRouting && <LoaderWithBackground />}
    </div>
  );
}

function CertificationListItem({ campaign }: { campaign: Campaign }) {
  const { setCampaign } = useStateVariables();
  const { routeToPage, isRouting } = useNavigation();
  const currentDate = dayjs();
  const isEditable = currentDate < campaign?.startedAt;

  const handleDeleteCampaign = async () => {
    try {
      const response = await fetch(`/api/cms/campaign/${campaign.id}`, {
        method: 'DELETE',
        body: JSON.stringify({
          campaignId: campaign.id,
        }),
      });

      if (!response.ok) {
        toast.error('Failed to delete campaign');
        return;
      }

      toast.success('Campaign deleted successfully');
    } catch (error) {
      toast.error(`Error deleting campaign: ${error}`);
      console.error('Error deleting campaign:', error);
    }
  };

  return (
    <>
      <div className="h-[6.25rem] w-[24.25rem] flex px-6 gap-[2.625rem] items-center border border-zinc-200 rounded-lg justify-between shadow-sm">
        <button
          type="button"
          className=" grow min-w-0 cursor-pointer h-full text-left px-3 flex flex-col justify-center"
          onClick={() => {
            setCampaign(campaign);
            routeToPage(`/dashboard/${campaign.id}/overview`);
          }}
        >
          <h3 className="text-size-24px font-semibold break-words">
            {campaign.name}
          </h3>
          <time className="text-zinc-500 text-size-14px">
            {`${dayjs(campaign.startedAt).format('YYYY.MM.DD')} ~ 
          ${dayjs(campaign.endedAt).format('YYYY.MM.DD')}`}
          </time>
        </button>
        <div className="flex gap-3">
          {isEditable ? (
            <>
              <CustomAlertDialog
                trigger={
                  <Button
                    variant="ghost"
                    className="p-0 aspect-square size-[1.875rem] rounded-sm "
                  >
                    <Trash2
                      style={{ width: '1.25rem', height: '1.25rem' }}
                      className="text-red-500"
                    />
                  </Button>
                }
                description="Once deleted, the registered data cannot be restored. Are you sure you want to delete?"
                buttons={[
                  {
                    label: 'Cancel',
                    variant: 'secondary',
                    type: 'cancel',
                  },
                  {
                    label: 'Delete',
                    variant: 'delete',
                    type: 'delete',
                    onClick: handleDeleteCampaign,
                  },
                ]}
              />
              <Button
                className="p-0 aspect-square size-[1.875rem] rounded-sm"
                variant="ghost"
                onClick={() => {
                  setCampaign(campaign);
                  routeToPage(`/campaign/edit/${campaign.id}`);
                }}
              >
                <Pen className="text-blue-600" />
              </Button>
            </>
          ) : (
            <div className="w-[4.5rem]" />
          )}
        </div>
      </div>
      {isRouting && <LoaderWithBackground />}
    </>
  );
}
