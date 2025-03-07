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
  badgeActivities: BadgeActivity[];
  lastCompletedStage: number;
  score: number;
};

type BadgeActivity = {
  order?: number;
  activityId?: string;
  hasAttended?: boolean;
};
