import { UserMenu } from '@/components/user-menu';

const Topbar = (props: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div {...props}>
      <div className="flex items-center text-size-18px font-medium space-x-2">
        <img src="/assets/svg/logo.svg" alt="logo" className="size-8" />
        <span className="font-roboto font-bold text-white top-[0.05rem] relative">
          Certification Admin
        </span>
      </div>
      <UserMenu className="col-span-2 justify-end" />
    </div>
  );
};

export default Topbar;
