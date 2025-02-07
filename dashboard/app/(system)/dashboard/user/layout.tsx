import UserFilterForm from './@filters/page';
import { UserProvider } from './_provider/provider';

type Props = {
  children: React.ReactNode;
  filters: any;
};

const UserLayout = ({ children }: Props) => {
  return (
    <UserProvider>
      <UserFilterForm />
      <div className="mt-3">{children}</div>
    </UserProvider>
  );
};

export default UserLayout;
