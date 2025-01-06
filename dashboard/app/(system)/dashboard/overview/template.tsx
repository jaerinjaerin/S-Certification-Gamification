import OverviewAchievementInfo from "./(infos)/@achievement/page";
import OverviewExpertsByGroupInfo from "./(infos)/@experts-by-group/page";
import OverviewExpertsInfo from "./(infos)/@experts/page";
import OverviewParticipantsInfo from "./(infos)/@participants/page";
import OverviewAchievementRate from "./(statistics)/@achievement-rate/page";
import OverviewExperts from "./(statistics)/@experts/page";
import OverviewGoalAchievement from "./(statistics)/@progress-of-goal-achievement/page";
import OverviewFilterForm from "./@filters/page";

const OverviewTemplete = () => {
  return (
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
  );
};

export default OverviewTemplete;
