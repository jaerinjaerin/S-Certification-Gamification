import React from 'react';
import UserFilterForm from './filters/page';

const UserStats = ({
  infoDomain,
  statisticsOutcome,
  statisticsProgressOfExperts,
}: {
  infoDomain: React.ReactNode;
  statisticsOutcome: React.ReactNode;
  statisticsProgressOfExperts: React.ReactNode;
}) => {
  return (
    <div className="space-y-3">
      <UserFilterForm />
      {infoDomain}
      {statisticsProgressOfExperts}
      {statisticsOutcome}
    </div>
  );
};

export default UserStats;
