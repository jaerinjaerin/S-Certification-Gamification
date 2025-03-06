import UserOutcome from './@statisticsOutcome/page';
import UserDomain from './@infoDomain/page';
import UserProgressExperts from './@statisticsProgressOfExperts/page';
import { getSearchParams } from '@/lib/params';
import { prisma } from '@/model/prisma';

const UserStats = async ({ params }: { params: { campaign: string } }) => {
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
      {/*<UserList />*/}
      <UserDomain searchParams={searchParams} />
      <UserProgressExperts searchParams={searchParams} />
      <UserOutcome searchParams={searchParams} />
    </div>
  );
};

export default UserStats;
