import UserFilterForm from "./@filters/page";
import UserOutcome from "./(statistics)/@outcome/page";
import { UserProvider } from "../user/_provider/provider";
import UserDomain from "./(info)/@domain/page";
import UserProgressExperts from "./(statistics)/@progress-of-experts/page";
import UserList from "@/app/(system)/dashboard/user/(info)/@list/page";

const UserTemplete = () => {
  return (
    <UserProvider>
      <div className="space-y-3">
        <UserFilterForm />
        <UserList />
        <UserDomain />
        <UserProgressExperts />
        <UserOutcome />
      </div>
    </UserProvider>
  );
};

export default UserTemplete;
