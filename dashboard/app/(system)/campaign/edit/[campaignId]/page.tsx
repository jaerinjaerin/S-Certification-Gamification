'use client';
import CampaignEditForm from '../../_components/campaign-edit-form';
import useSWR from 'swr';
import { fetcher } from '@/app/(system)/(hub)/cms/lib/fetcher';
import { LoadingFullScreen } from '@/components/loader';

export default function EditCampaignPage({
  params,
}: {
  params: { campaignId: string };
}) {
  const { campaignId } = params;
  const { data, isLoading } = useSWR(
    `/api/cms/campaign/${campaignId}`,
    fetcher
  );

  if (isLoading) {
    return <LoadingFullScreen />;
  }
  if (!data) {
    return <div>Campaign not found</div>;
  }

  const editData = mapCampaignToFormData(data.result.campaign);

  return <CampaignEditForm initialData={editData} campaignId={campaignId} />;
}

function numberToString(value: number | null | undefined) {
  return value !== undefined && value !== null ? String(value) : undefined;
}

function mapCampaignToFormData(campaign: any) {
  return {
    certificationName: campaign.name,
    slug: campaign.slug,
    isSlugChecked: true,
    startDate: new Date(campaign.startedAt),
    endDate: new Date(campaign.endedAt),
    copyMedia: campaign.contentCopyHistory?.imageCampaignName || '',
    copyTarget: campaign.contentCopyHistory?.targetCampaignName || '',
    copyUiLanguage: campaign.contentCopyHistory?.uiLanguageCampaignName || '',
    numberOfStages: numberToString(campaign.settings.totalStages),
    firstBadgeName: campaign.settings.firstBadgeName,
    ffFirstBadgeStage: numberToString(campaign.settings.ffFirstBadgeStageIndex),
    fsmFirstBadgeStage: numberToString(
      campaign.settings.fsmFirstBadgeStageIndex
    ),
    secondBadgeName: campaign.settings.secondBadgeName || '',
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
