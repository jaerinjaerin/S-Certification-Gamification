import { toast } from 'sonner';
import CampaignForm from '../../_components/campaign-form';

export default async function EditCampaignPage({
  params,
}: {
  params: { campaignId: string };
}) {
  const { campaignId } = params;
  const campaign = await getCampaign(campaignId);

  if (!campaign) {
    return <div>Campaign not found</div>;
  }

  const editData = mapCampaignToFormData(campaign);

  return (
    <CampaignForm initialData={editData} isEditMode campaignId={campaignId} />
  );
}

async function getCampaign(campaignId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/cms/campaign/${campaignId}`,
      { cache: 'no-cache' }
    );

    if (!response.ok) {
      toast.error('Failed to fetch campaign');
      return null;
    }

    const data = await response.json();
    return data.result.campaign;
  } catch (error) {
    toast.error('Error fetching campaign');
    console.error(error);
    return null;
  }
}

function numberToString(value: number | null | undefined) {
  return value !== undefined && value !== null ? String(value) : undefined;
}

// 캠페인 데이터를 폼 데이터로 매핑
function mapCampaignToFormData(campaign: any) {
  return {
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
}
