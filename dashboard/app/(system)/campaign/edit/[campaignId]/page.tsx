import CampaignForm from '../../_components/campaign-form';

export default async function EditCampaignPage({
  params,
}: {
  params: { campaignId: string };
}) {
  // TODO: 데이터 Fetch 필요

  const data = {
    certificationName: 'testS25',
    slug: 'testS25',
    isSlugChecked: true,
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-01-01'),
    copyMedia: undefined,
    copyTarget: undefined,
    copyUiLanguage: undefined,
    numberOfStages: 3,
    firstBadgeName: 'Expert',
    ffFirstBadgeStage: 1,
    fsmFirstBadgeStage: 2,
    secondBadgeName: 'Advanced',
    ffSecondBadgeStage: 3,
    fsmSecondBadgeStage: 4,
    targetSourceCampaignId: undefined,
    imageSourceCampaignId: undefined,
    uiLanguageSourceCampaignId: undefined,
  };

  return <CampaignForm initialData={data} isEditMode />;
}
