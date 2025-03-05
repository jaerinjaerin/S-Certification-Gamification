import OverviewAchievementInfo from './@infoAchievement/page';
import OverviewExpertsByGroupInfo from './@infoExpertsByGroup/page';
import OverviewExpertsInfo from './@infoExperts/page';
import OverviewParticipantsInfo from './@infoParticipants/page';
import OverviewAchievementRate from './@statisticsAchievementRate/page';
import OverviewExperts from './@statisticsExperts/page';
import OverviewGoalAchievement from './@statisticsProgressOfGoalAchievement/page';
import { OverviewProvider } from './_provider/provider';
import OverviewFilterForm from './@filters/page';

const OverviewTemplete = () => {
  return (
    <OverviewProvider>
      <div className="space-y-3">
        <OverviewFilterForm />
        <div className="flex space-x-2">
          <OverviewParticipantsInfo />
          <OverviewExpertsInfo />
          <OverviewAchievementInfo />
          <OverviewExpertsByGroupInfo />
        </div>
        <OverviewAchievementRate />
        <OverviewExperts />
        <OverviewGoalAchievement />
      </div>
    </OverviewProvider>
  );
};

export default OverviewTemplete;
