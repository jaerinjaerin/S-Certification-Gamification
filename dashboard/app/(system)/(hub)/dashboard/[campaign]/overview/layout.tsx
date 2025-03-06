import OverviewExpertsByGroupInfo from './@infoExpertsByGroup/page';
import OverviewExpertsInfo from './@infoExperts/page';
import OverviewParticipantsInfo from './@infoParticipants/page';
import OverviewExperts from './@statisticsExperts/page';
import OverviewGoalAchievement from './@statisticsProgressOfGoalAchievement/page';
import OverviewFilterForm from './@filters/page';
import OverviewAchievementInfo from './@infoAchievement/page';
import OverviewAchievementRate from './@statisticsAchievementRate/page';
import { getSearchParams } from '@/lib/params';
import { prisma } from '@/model/prisma';

const OverviewLayout = async ({ params }: { params: { campaign: string } }) => {
  const searchParams = getSearchParams();
  if (!searchParams.get('date.from')) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.campaign },
    });
    if (campaign) {
      searchParams.set('date.from', campaign.startedAt.toISOString());
      searchParams.set('date.to', campaign.endedAt.toISOString());
    }
  }
  searchParams.set('campaign', params.campaign);

  return (
    <div className="space-y-3">
      <OverviewFilterForm />
      <div className="flex space-x-2">
        <OverviewParticipantsInfo searchParams={searchParams} />
        <OverviewExpertsInfo searchParams={searchParams} />
        <OverviewAchievementInfo searchParams={searchParams} />
        <OverviewExpertsByGroupInfo searchParams={searchParams} />
      </div>
      <OverviewAchievementRate searchParams={searchParams} />
      <OverviewExperts searchParams={searchParams} />
      <OverviewGoalAchievement searchParams={searchParams} />
    </div>
  );
};

export default OverviewLayout;
