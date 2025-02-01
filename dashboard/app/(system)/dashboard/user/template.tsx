import UserFilterForm from './@filters/page';
import UserOutcome from './@statisticsOutcome/page';
import { UserProvider } from '../user/_provider/provider';
import UserDomain from './@infoDomain/page';
import UserProgressExperts from './@statisticsProgressOfExperts/page';

const UserTemplete = () => {
  return (
    <UserProvider>
      <div className="space-y-3">
        <UserFilterForm />
        {/*<UserList />*/}
        <UserDomain />
        <UserProgressExperts />
        <UserOutcome />
      </div>
    </UserProvider>
  );
};

export default UserTemplete;
