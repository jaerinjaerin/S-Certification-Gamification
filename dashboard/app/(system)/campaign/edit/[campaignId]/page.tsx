import { toast } from 'sonner';
import CampaignForm from '../../_components/campaign-form';

export default async function EditCampaignPage({
  params,
}: {
  params: { campaignId: string };
}) {
  const getCampaign = async (campaignId: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/cms/campaign/${campaignId}`,
      {
        cache: 'no-cache',
      }
    );
    if (!response.ok) {
      toast.error('Failed to fetch campaign');
      return;
    }
    const data = await response.json();
    return data;
  };

  const data = await getCampaign(params.campaignId);
  const { campaign } = data.result;

  const numberToString = (value: number | null) =>
    value != null ? value.toString() : null;

  const editData = {
    certificationName: campaign.name,
    slug: campaign.slug,
    isSlugChecked: true,
    startDate: new Date(campaign.startedAt),
    endDate: new Date(campaign.endedAt),
    copyMedia: undefined,
    copyTarget: undefined,
    copyUiLanguage: undefined,
    numberOfStages: numberToString(campaign.settings.totalStages),
    firstBadgeName: campaign.settings.firstBadgeName,
    ffFirstBadgeStage: numberToString(campaign.settings.ffFirstBadgeStageIndex),
    fsmFirstBadgeStage: numberToString(
      campaign.settings.fsmFirstBadgeStageIndex
    ),
    secondBadgeName: campaign.settings.secondBadgeName,
    ffSecondBadgeStage: numberToString(
      campaign.settings.ffSecondBadgeStageIndex
    ),
    fsmSecondBadgeStage: numberToString(
      campaign.settings.fsmSecondBadgeStageIndex
    ),
    targetSourceCampaignId: undefined,
    imageSourceCampaignId: undefined,
    uiLanguageSourceCampaignId: undefined,
  };

  return (
    <CampaignForm
      initialData={editData}
      isEditMode
      campaignId={params.campaignId}
    />
  );
}
