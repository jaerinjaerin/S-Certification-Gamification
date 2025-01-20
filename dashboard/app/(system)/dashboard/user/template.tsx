import UserFilterForm from "./@filters/page";
import UserOutcome from "./(statics)/@outcome/page";
import { UserProvider } from "../user/_provider/provider";
import UserDomain from "./(info)/@domain/page";
import UserProgressExperts from "./(statics)/@progress-of-experts/page";

const UserTemplete = () => {
  return (
    <UserProvider>
      <div className="space-y-3">
        <UserFilterForm />
        <UserDomain />
        <UserProgressExperts />
        <UserOutcome />
      </div>
    </UserProvider>
  );
};

export default UserTemplete;
