import React from 'react';
import OverviewFilterForm from './filters/page';

const OverviewLayout = ({
  infoParticipants,
  infoExperts,
  infoAchievement,
  infoExpertsByGroup,
  statisticsAchievementRate,
  statisticsExperts,
  statisticsProgressOfGoalAchievement,
}: {
  infoParticipants: React.ReactNode;
  infoExperts: React.ReactNode;
  infoAchievement: React.ReactNode;
  infoExpertsByGroup: React.ReactNode;
  statisticsAchievementRate: React.ReactNode;
  statisticsExperts: React.ReactNode;
  statisticsProgressOfGoalAchievement: React.ReactNode;
}) => {
  return (
    <div className="space-y-3">
      <OverviewFilterForm />
      <div className="flex space-x-2">
        {infoParticipants}
        {infoExperts}
        {infoAchievement}
        {infoExpertsByGroup}
      </div>
      {statisticsAchievementRate}
      {statisticsExperts}
      {statisticsProgressOfGoalAchievement}
    </div>
    // <div className="space-y-3">
    //   <OverviewFilterForm />
    //   <div className="flex space-x-2">
    //     <OverviewParticipantsInfo params={params} />
    //     <OverviewExpertsInfo params={params} />
    //     <OverviewAchievementInfo params={params} />
    //     <OverviewExpertsByGroupInfo params={params} />
    //   </div>
    //   <OverviewAchievementRate params={params} />
    //   <OverviewExperts params={params} />
    //   <OverviewGoalAchievement params={params} />
    // </div>
  );
};

export default OverviewLayout;
