import React from 'react';

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
      {infoDomain}
      {statisticsProgressOfExperts}
      {statisticsOutcome}
    </div>
    // <div className="space-y-3">
    //   <UserDomain params={params} />
    //   <UserProgressExperts params={params} />
    //   <UserOutcome params={params} />
    // </div>
  );
};

export default UserStats;
