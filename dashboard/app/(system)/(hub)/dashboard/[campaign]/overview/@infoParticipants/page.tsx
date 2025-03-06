import { URLSearchParams } from 'url';
import InfoCardStyleContent from '../_components/card-content';
import InfoCardStyleContainer from '../_components/card-with-title';
import { getParticipantCount } from '@/app/actions/dashboard/overview/participant-action';

const OverviewParticipantsInfo = async ({
  searchParams,
}: {
  searchParams: URLSearchParams;
}) => {
  const count = await getParticipantCount(searchParams);

  return (
    <InfoCardStyleContainer title="Participants" iconName="user">
      <InfoCardStyleContent info={count} caption="Total paricipants" />
    </InfoCardStyleContainer>
  );
};

export default OverviewParticipantsInfo;
