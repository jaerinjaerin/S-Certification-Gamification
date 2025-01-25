type UserListProps = {
  userId: string;
  id: string;
  authType: string;
  region: string;
  subsidiary: string;
  domain: string;
  quizDomain: string;
  providerUserId: string;
  providerPersonId: string;
  badgeActivities: BadgeActivitiy[];
  lastCompletedStage: number;
  score: number;
};

type BadgeActivitiy = {
  order: number;
  activityId: string;
};
