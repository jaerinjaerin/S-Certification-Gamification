import UserOutcome from './@statisticsOutcome/page';
import UserDomain from './@infoDomain/page';
import UserProgressExperts from './@statisticsProgressOfExperts/page';

const UserStats = () => {
  return (
    <div className="space-y-3">
      {/*<UserList />*/}
      <UserDomain />
      <UserProgressExperts />
      <UserOutcome />
    </div>
  );
};

export default UserStats;
