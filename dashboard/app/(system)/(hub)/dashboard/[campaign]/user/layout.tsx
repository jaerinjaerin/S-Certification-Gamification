import UserFilterForm from './filters/page';

type Props = {
  children: React.ReactNode;
};

const UserLayout = ({ children }: Props) => {
  return (
    <div className="space-y-3">
      <UserFilterForm />
      <div className="mt-3">{children}</div>
    </div>
  );
};

export default UserLayout;
